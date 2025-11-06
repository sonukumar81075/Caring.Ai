import React, { useState, useEffect } from 'react';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Search, 
    Filter,
    MoreVertical,
    CheckCircle,
    XCircle,
    Eye,
    EyeOff,
    Globe2
} from 'lucide-react';
import {
    Modal,
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import { Person, Email, Phone, MedicalServices } from '@mui/icons-material';
import ethnicityService from '../../services/ethnicityService';

// Material-UI Modal style (matching DoctorFormModal)
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 4,
    maxHeight: '90vh',
    overflow: 'auto'
};

const Ethnicities = () => {
    const [ethnicities, setEthnicities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingEthnicity, setEditingEthnicity] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 10
    });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active'
    });

    // Load ethnicities
    const loadEthnicities = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page,
                limit: pagination.itemsPerPage,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            };
            
            const response = await ethnicityService.getAllEthnicities(params);
            setEthnicities(response?.ethnicities);
            setPagination(response?.pagination);
        } catch (err) {
            setError(err.message || 'Failed to load ethnicities');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEthnicities();
    }, [searchTerm, statusFilter]);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editingEthnicity) {
                await ethnicityService.updateEthnicity(editingEthnicity._id, formData);
                setSuccess('Ethnicity updated successfully');
            } else {
                await ethnicityService.createEthnicity(formData);
                setSuccess('Ethnicity created successfully');
            }
            
            setShowModal(false);
            setEditingEthnicity(null);
            resetForm();
            loadEthnicities(pagination.currentPage);
        } catch (err) {
            setError(err.message || 'Failed to save ethnicity');
        } finally {
            setLoading(false);
        }
    };

    // Handle edit
    const handleEdit = (ethnicity) => {
        setEditingEthnicity(ethnicity);
        setFormData({
            name: ethnicity.name,
            description: ethnicity.description,
            status: ethnicity.status
        });
        setShowModal(true);
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this ethnicity?')) {
            return;
        }  
        setLoading(true);
        setError('');
        try {
            await ethnicityService.deleteEthnicity(id);
            setSuccess('Ethnicity deleted successfully');
            loadEthnicities(pagination.currentPage);
        } catch (err) {
            setError(err.message || 'Failed to delete ethnicity');
        } finally {
            setLoading(false);
        }
    };

    // Handle status toggle
    const handleToggleStatus = async (id) => {
        setLoading(true);
        setError('');
        try {
            await ethnicityService.toggleEthnicityStatus(id);
            setSuccess('Ethnicity status updated successfully');
            loadEthnicities(pagination.currentPage);
        } catch (err) {
            setError(err.message || 'Failed to update ethnicity status');
        } finally {
            setLoading(false);
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: 'active'
        });
    };

    // Handle modal close
    const handleModalClose = () => {
        setShowModal(false);
        setEditingEthnicity(null);
        resetForm();
        setError('');
        setSuccess('');
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        loadEthnicities(newPage);
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                    Ethnicities Management
                </h2>
                <p className="text-sm text-gray-600">
                    Manage ethnicities with their names, descriptions, and status.
                </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-[#BAA377] hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 cursor-pointer"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ethnicity
                </button>

                <div className="flex-1 flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search ethnicities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-text"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : ethnicities.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        No ethnicities found
                                    </td>
                                </tr>
                            ) : (
                                ethnicities.map((ethnicity) => (
                                    <tr key={ethnicity?._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {ethnicity?.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {ethnicity?.description}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                ethnicity?.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {ethnicity?.status === 'active' ? (
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <XCircle className="w-3 h-3 mr-1" />
                                                )}
                                                {ethnicity?.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(ethnicity?.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(ethnicity?._id)}
                                                    className={`p-1 rounded cursor-pointer ${
                                                        ethnicity?.status === 'active' 
                                                            ? 'text-red-600 hover:bg-red-50' 
                                                            : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                    title={ethnicity?.status === 'active' ? 'Deactivate' : 'Activate'}
                                                >
                                                    {ethnicity.status === 'active' ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(ethnicity)}
                                                    className="p-1 text-gray-600 hover:bg-blue-50 rounded cursor-pointer"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(ethnicity._id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing{' '}
                                    <span className="font-medium">
                                        {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium">{pagination.totalItems}</span>{' '}
                                    results
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={pagination.currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Previous
                                    </button>
                                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
                                                page === pagination.currentPage
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-gray-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Next
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Modal open={showModal} onClose={handleModalClose}>
                <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        {editingEthnicity ? 'Edit Ethnicity' : 'Add New Ethnicity'}
                    </Typography>

                    {/* HIPAA Notice */}
                    <Alert severity="info" sx={{ mb: 3 }}>
                        This form manages ethnicity configurations and is secured in compliance with HIPAA regulations.
                    </Alert>

                    {/* Ethnicity Name */}
                    <TextField
                        fullWidth
                        name="name"
                        label="Ethnicity Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Globe2 />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />

                    {/* Description */}
                    <TextField
                        fullWidth
                        name="description"
                        label="Description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                        multiline
                        rows={3}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <MedicalServices />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mb: 2 }}
                    />

                    {/* Status */}
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            label="Status"
                        >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                        <Button
                            onClick={handleModalClose}
                            variant="outlined"
                            color="error"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (editingEthnicity ? 'Update Ethnicity' : 'Add Ethnicity')}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default Ethnicities;
