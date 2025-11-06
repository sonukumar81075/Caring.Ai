/**
 * Node.js equivalent of PHP getUserIP() function
 * 
 * PHP Code:
 * function getUserIP() {
 *   if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
 *     $ip = $_SERVER['HTTP_CLIENT_IP'];
 *   } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
 *     $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
 *   } else {
 *     $ip = $_SERVER['REMOTE_ADDR'];
 *   }
 *   return $ip;
 * }
 */

/**
 * Get user IP address using the same logic as PHP getUserIP()
 * @param {Object} req - Express request object
 * @returns {string} - User IP address
 */
export const getUserIP = (req) => {
  try {
    // PHP equivalent: $_SERVER['HTTP_CLIENT_IP']
    if (req.headers['http-client-ip'] || req.headers['client-ip']) {
      return req.headers['http-client-ip'] || req.headers['client-ip'];
    }
    
    // PHP equivalent: $_SERVER['HTTP_X_FORWARDED_FOR']
    if (req.headers['x-forwarded-for']) {
      // Handle comma-separated list (proxy chains)
      const ips = req.headers['x-forwarded-for'].split(',').map(ip => ip.trim());
      return ips[0]; // Return first IP (original client)
    }
    
    // PHP equivalent: $_SERVER['REMOTE_ADDR']
    // This is the direct connection IP
    return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
    
  } catch (error) {
    console.error('Error getting user IP:', error);
    return req.ip || 'unknown';
  }
};


/**
 * Get real public IP address using ipify API
 * @returns {Promise<string>} - Real public IP address
 */
export const getRealPublicIP = async () => {
  try {
    const response = await fetch('https://api64.ipify.org/?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error fetching real public IP:', error);
    return 'unknown';
  }
};

/**
 * Get user IP with fallback to real public IP
 * @param {Object} req - Express request object
 * @returns {Promise<string>} - User IP address or real public IP
 */
export const getUserIPWithRealFallback = async (req) => {
  try {
    // First try to get IP from request headers
    const requestIP = getUserIP(req);
    
    // If it's localhost/private IP, get real public IP
    if (requestIP === '::1' || requestIP === '127.0.0.1' || 
        requestIP.startsWith('192.168.') || requestIP.startsWith('10.') || 
        requestIP.startsWith('172.')) {
      // console.log(`Local/private IP detected (${requestIP}), fetching real public IP...`);
      const realIP = await getRealPublicIP();
      return realIP;
    }
    
    return requestIP;
  } catch (error) {
    console.error('Error getting user IP with real fallback:', error);
    return getUserIP(req);
  }
};

export default getUserIP;
