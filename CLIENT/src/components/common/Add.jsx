import { useState } from "react";
// import { useForm } from "react-hook-form";
import { useCurrentUser } from "../../context.jsx";
import { useFetchData } from "../../hooks/fetchData.js";
import Swal from "sweetalert2";

function Add({
    type,
    setIsChange,
    inputs = [],
    defaultValue = {},
    name = "Add",
    buttonClassName = "btn-primary",
    validationRules = {},
    customTitle
}) {
    const { currentUser } = useCurrentUser();
    const [isLoading, setIsLoading] = useState(false);
    const fetchData = useFetchData();

    const createFormHTML = () => {
        return `
            <form id="swal-form" style="text-align: left;">
                ${inputs.map((input) => `
                    <div style="margin-bottom: 15px;">
                        <label for="swal-${input}" style="display: block; margin-bottom: 5px; font-weight: bold;">
                            ${input.charAt(0).toUpperCase() + input.slice(1)}:
                        </label>
                        ${input === 'details' || input === 'requirements' ?
                `<textarea 
                                id="swal-${input}" 
                                name="${input}"
                                placeholder="Enter ${input}"
                                style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; min-height: 80px;"
                            ></textarea>` :
                `<input 
                                id="swal-${input}" 
                                name="${input}"
                                type="${input === 'experience' ? 'number' : 'text'}"
                                placeholder="Enter ${input}"
                                style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"
                            />`
            }
                    </div>
                `).join('')}
            </form>
        `;
    };

    const getFormData = () => {
        const formData = {};
        inputs.forEach(input => {
            const element = document.getElementById(`swal-${input}`);
            if (element) {
                formData[input] = element.value;
            }
        });
        // if (currentUser?.id) {
        //     formData.userId = currentUser.id;
        // }
        Object.keys(defaultValue).forEach(key => {
            if (!formData[key]) {
                formData[key] = defaultValue[key];
            }
        });

        return formData;
    };

    const validateFormData = (data) => {
        const errors = [];

        inputs.forEach(input => {
            const value = data[input];
            const rules = validationRules[input] || {};

            if (rules.required !== false && (!value || value.toString().trim() === '')) {
                errors.push(`${input.charAt(0).toUpperCase() + input.slice(1)} is required`);
            }

            if (rules.minLength && value && value.length < rules.minLength) {
                errors.push(`${input.charAt(0).toUpperCase() + input.slice(1)} must be at least ${rules.minLength} characters`);
            }

            if (rules.maxLength && value && value.length > rules.maxLength) {
                errors.push(`${input.charAt(0).toUpperCase() + input.slice(1)} must be no more than ${rules.maxLength} characters`);
            }
        });
        return errors;
    };

    const addFunc = async (data) => {
        try {
            await fetchData({
                type,
                method: "POST",
                body: data,
                role: `/${currentUser.role}`,
                onSuccess: (result) => {
                    console.log("Add successful:", result);
                    setIsChange((prev) => prev + 1);

                    Swal.fire({
                        title: 'Success!',
                        text: `${type} added successfully`,
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                },
                onError: (error) => {
                    console.error("Add failed:", error);
                    Swal.fire({
                        title: 'Error!',
                        text: error.message || 'Failed to add item',
                        icon: 'error'
                    });
                },
            });
        } catch (error) {
            console.error("Unexpected error:", error);
            Swal.fire({
                title: 'Error!',
                text: 'An unexpected error occurred',
                icon: 'error'
            });
        }
    };

    const openAddModal = async () => {
        if (!currentUser) {
            Swal.fire({
                title: 'Not logged in',
                text: 'You must be logged in to add items.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Go to login',
                cancelButtonText: 'Cancel',
            }).then((result) => {
                if (result.isConfirmed) {
                    // navigate('/login'); // uncomment if you have navigate
                    window.location.href = '/login';
                }
            });
            return;
        }

        const result = await Swal.fire({
            title: customTitle || `Add ${type}`,
            html: createFormHTML(),
            showCancelButton: true,
            confirmButtonText: 'Add',
            cancelButtonText: 'Cancel',
            width: '600px',
            preConfirm: () => {
                setIsLoading(true);

                const formData = getFormData();
                const validationErrors = validateFormData(formData);

                if (validationErrors.length > 0) {
                    setIsLoading(false);
                    Swal.showValidationMessage(validationErrors.join('<br>'));
                    return false;
                }

                return formData;
            },
            didOpen: () => {
                Object.keys(defaultValue).forEach(key => {
                    const element = document.getElementById(`swal-${key}`);
                    if (element) {
                        element.value = defaultValue[key];
                    }
                });

                if (inputs.length > 0) {
                    const firstInput = document.getElementById(`swal-${inputs[0]}`);
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            }
        });

        setIsLoading(false);

        if (result.isConfirmed && result.value) {
            await addFunc(result.value);
        }
    };

    if (!inputs.length) return null;

    return (
        <button
            className={buttonClassName}
            onClick={openAddModal}
            disabled={isLoading}
        >
            {isLoading ? "Adding..." : name}
        </button>
    );
}

export default Add;