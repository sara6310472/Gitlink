import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetchData } from "./fetchData.js";
import { useCurrentUser } from "../context.jsx";
import Cookies from 'js-cookie';

const COOKIE_CONFIG = {
    expires: 1,
    secure: true,
    sameSite: 'Strict',
};

const MESSAGES = {
    LOGIN_SUCCESS: 'Login successful! Redirecting...',
    LOGIN_ERROR: 'Incorrect username or password',
    REGISTER_SUCCESS: 'Registration successful! Redirecting...',
    REGISTER_ERROR: 'Registration failed. Please try again.',
    CONNECTION_ERROR: 'Connection error. Please try again.',
    GENERAL_ERROR: 'An error occurred. Please try again.',
    FORGOT_PASSWORD_SUCCESS: 'Password reset email sent successfully! Check your inbox.',
    FORGOT_PASSWORD_ERROR: 'Failed to send reset email',
    USERNAME_REQUIRED: 'Please enter your username first',
    USERNAME_CHECK_ERROR: 'Failed to check username availability',
};

export const useAuth = () => {
    const { setCurrentUser } = useCurrentUser();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
    const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
    const [usernameStatus, setUsernameStatus] = useState(null);
    const [suggestedUsernames, setSuggestedUsernames] = useState([]);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Registration form state
    const [step, setStep] = useState(1);
    const [selectedRole, setSelectedRole] = useState("");
    const [stepOneData, setStepOneData] = useState({});
    const [useGitAvatar, setUseGitAvatar] = useState(false);

    // File handling state
    const [profileImage, setProfileImage] = useState(null);
    const [cvFile, setCvFile] = useState(null);

    const navigate = useNavigate();
    const fetchData = useFetchData();

    const storeUserData = (user, token) => {
        Cookies.set('accessToken', token, COOKIE_CONFIG);

        const enhancedUser = {
            ...user,
            initiatedAction: false,
        };

        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentUser(enhancedUser);

        return enhancedUser;
    };

    const getRedirectPath = (user) => {
        return `/${user.git_name || user.username}/home`;
    };

    const checkUsernameAvailability = async (username) => {
        if (!username || username.length < 3) {
            setUsernameStatus(null);
            setSuggestedUsernames([]);
            return;
        }

        setIsCheckingUsername(true);
        setUsernameStatus('checking');

        try {
            const response = await fetch(`http://localhost:3001/check-username/${username}`);
            const data = await response.json();

            if (data.available) {
                setUsernameStatus('available');
                setSuggestedUsernames([]);
            } else {
                setUsernameStatus('taken');
                const suggestions = Object.keys(data)
                    .filter(key => !isNaN(key))
                    .map(key => data[key]);
                setSuggestedUsernames(suggestions);
            }
        } catch (error) {
            console.error('Error checking username:', error);
            setUsernameStatus('error');
            setSuggestedUsernames([]);
        } finally {
            setIsCheckingUsername(false);
        }
    };

    const clearUsernameCheck = () => {
        setUsernameStatus(null);
        setSuggestedUsernames([]);
        setIsCheckingUsername(false);
    };

    // File upload handlers
    const triggerFileUpload = (accept, onFileSelect) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.style.display = 'none';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                onFileSelect(file);
            }
            document.body.removeChild(input);
        };

        document.body.appendChild(input);
        input.click();
    };

    const uploadProfileImage = () => {
        triggerFileUpload('image/*', setProfileImage);
    };

    const uploadCvFile = () => {
        triggerFileUpload('.pdf', setCvFile);
    };

    // Registration step management
    const goToStepTwo = (data) => {
        setStepOneData(data);
        setStep(2);
    };

    const resetRegistrationForm = () => {
        setStep(1);
        setSelectedRole("");
        setStepOneData({});
        setUseGitAvatar(false);
        setProfileImage(null);
        setCvFile(null);
    };

    // Form data builder
    const buildFormData = (stepTwoData) => {
        const ROLES = { DEVELOPER: 1, RECRUITER: 2 };
        const formData = new FormData();

        formData.append("username", stepOneData.username);
        formData.append("password", stepOneData.password);
        formData.append("role_id", selectedRole);
        formData.append("email", stepTwoData.email);
        formData.append("phone", stepTwoData.phone);

        if (selectedRole === ROLES.DEVELOPER) {
            formData.append("git_name", stepTwoData.git_name);
            formData.append("experience", stepTwoData.experience);
            formData.append("languages", stepTwoData.languages || "");
            formData.append("about", stepTwoData.about || "");

            if (useGitAvatar) {
                formData.append("profile_image", `https://github.com/${stepTwoData.git_name}.png`);
            } else if (profileImage) {
                formData.append("profile_image", profileImage);
            }

            if (cvFile) {
                formData.append("cv_file", cvFile);
            }
        } else if (selectedRole === ROLES.RECRUITER) {
            formData.append("company_name", stepTwoData.company_name || "");
            if (profileImage) {
                formData.append("profile_image", profileImage);
            }
        }
        return formData;
    };

    const login = async (credentials) => {
        setIsLoading(true);
        setMessage('');
        try {
            await fetchData({
                type: 'login',
                method: 'POST',
                body: credentials,
                onSuccess: (res) => {
                    if (res?.token && res?.user) {
                        const enhancedUser = storeUserData(res.user, res.token);
                        setMessage(MESSAGES.LOGIN_SUCCESS);
                        navigate(getRedirectPath(enhancedUser));
                    } else {
                        setMessage(MESSAGES.LOGIN_ERROR);
                    }
                },
                onError: () => {
                    setMessage(MESSAGES.CONNECTION_ERROR);
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            setMessage(MESSAGES.GENERAL_ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (stepTwoData) => {
        setIsLoading(true);
        setMessage('');
        try {
            const formData = buildFormData(stepTwoData);
            await fetchData({
                type: 'register',
                method: 'POST',
                body: formData,
                onSuccess: ({ user, token }) => {
                    if (user && token) {
                        const enhancedUser = storeUserData(user, token);
                        setMessage(MESSAGES.REGISTER_SUCCESS);
                        resetRegistrationForm();
                        navigate(getRedirectPath(enhancedUser));
                    } else {
                        setMessage(MESSAGES.REGISTER_ERROR);
                    }
                },
                onError: (errorMessage) => {
                    console.error('Registration error:', errorMessage);
                    setMessage(MESSAGES.REGISTER_ERROR);
                },
            });
        } catch (error) {
            console.error('Registration error:', error);
            setMessage(MESSAGES.REGISTER_ERROR);
        } finally {
            setIsLoading(false);
        }
    };

    const forgotPassword = async (username) => {
        if (!username?.trim()) {
            setForgotPasswordMessage(MESSAGES.USERNAME_REQUIRED);
            return;
        }
        setForgotPasswordLoading(true);
        setForgotPasswordMessage('');
        try {
            await fetchData({
                type: 'forgot-password',
                method: 'POST',
                body: { username: username.trim() },
                onSuccess: () => {
                    setForgotPasswordMessage(MESSAGES.FORGOT_PASSWORD_SUCCESS);
                },
                onError: (err) => {
                    const errorMessage = err?.message || MESSAGES.FORGOT_PASSWORD_ERROR;
                    setForgotPasswordMessage(errorMessage);
                },
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            setForgotPasswordMessage(MESSAGES.FORGOT_PASSWORD_ERROR);
        } finally {
            setForgotPasswordLoading(false);
        }
    };

    const clearMessage = () => setMessage('');
    const clearForgotPasswordMessage = () => setForgotPasswordMessage('');

    return {
        // Auth functions
        login,
        register,
        forgotPassword,

        // Auth state
        isLoading,
        message,
        forgotPasswordLoading,
        forgotPasswordMessage,
        clearMessage,
        clearForgotPasswordMessage,

        // Username validation
        checkUsernameAvailability,
        usernameStatus,
        suggestedUsernames,
        isCheckingUsername,
        clearUsernameCheck,

        // Registration form state
        step,
        setStep,
        selectedRole,
        setSelectedRole,
        stepOneData,
        useGitAvatar,
        setUseGitAvatar,
        goToStepTwo,
        resetRegistrationForm,

        // File handling
        profileImage,
        setProfileImage,
        cvFile,
        setCvFile,
        uploadProfileImage,
        uploadCvFile,
    };
};