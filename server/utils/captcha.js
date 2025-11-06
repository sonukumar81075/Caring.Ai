import crypto from 'crypto';

// Store captcha sessions in memory (in production, use Redis)
const captchaSessions = new Map();

/**
 * Generate a hidden captcha challenge
 */
export const generateHiddenCaptcha = () => {
    // Generate a simple math challenge
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operation = Math.random() > 0.5 ? '+' : '-';
    
    let answer;
    let challenge;
    
    if (operation === '+') {
        answer = num1 + num2;
        challenge = `${num1} + ${num2}`;
    } else {
        // For subtraction, ensure the first number is larger to avoid negative results
        const maxNum = Math.max(num1, num2);
        const minNum = Math.min(num1, num2);
        answer = maxNum - minNum;
        challenge = `${maxNum} - ${minNum}`;
    }
    
    // Generate session ID
    const sessionId = crypto.randomBytes(16).toString('hex');
    
    // Store challenge with expiration (5 minutes)
    captchaSessions.set(sessionId, {
        answer: answer,
        expires: Date.now() + (5 * 60 * 1000), // 5 minutes
        attempts: 0
    });
    
    return {
        sessionId,
        challenge: challenge
    };
};

/**
 * Verify hidden captcha response
 */
export const verifyHiddenCaptcha = (sessionId, userAnswer) => {
    const session = captchaSessions.get(sessionId);
    
    if (!session) {
        return { success: false, error: 'Invalid session' };
    }
    
    // Check if session expired
    if (Date.now() > session.expires) {
        captchaSessions.delete(sessionId);
        return { success: false, error: 'Session expired' };
    }
    
    // Increment attempts
    session.attempts++;
    
    // Check answer - handle both string and number inputs, including zero
    const userAnswerNum = parseInt(userAnswer, 10);
    const isCorrect = !isNaN(userAnswerNum) && userAnswerNum === session.answer;
    
    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Captcha verification: userAnswer="${userAnswer}", parsed=${userAnswerNum}, expected=${session.answer}, correct=${isCorrect}`);
    }
    
    if (isCorrect) {
        // Remove session on success
        captchaSessions.delete(sessionId);
        return { success: true };
    }
    
    // Limit attempts (3 max)
    if (session.attempts >= 3) {
        captchaSessions.delete(sessionId);
        return { success: false, error: 'Too many attempts' };
    }
    
    return { 
        success: false, 
        error: 'Incorrect answer',
        attemptsLeft: 3 - session.attempts
    };
};

/**
 * Clean up expired sessions (call this periodically)
 */
export const cleanupExpiredSessions = () => {
    const now = Date.now();
    for (const [sessionId, session] of captchaSessions.entries()) {
        if (now > session.expires) {
            captchaSessions.delete(sessionId);
        }
    }
};

// Clean up expired sessions every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);
