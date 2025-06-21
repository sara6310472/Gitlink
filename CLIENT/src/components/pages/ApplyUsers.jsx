import { useParams, Link, useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { useState, useEffect } from "react";
import { useFetchData } from "../../hooks/fetchData.js";
import { useLogout } from "../../hooks/LogOut";
import { useCurrentUser } from "../../context.jsx";
import Update from "../common/Update.jsx";
import Modal from "../common/Modal.jsx";
import '../../style/ApplyUsers.css';

function ApplyUsers() {
    const { id } = useParams();
    const fetchData = useFetchData();
    const logOut = useLogout();
    const navigate = useNavigate();
    const { currentUser } = useCurrentUser();
    const [isChange, setIsChange] = useState(0);
    const [applicants, setApplicants] = useState([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');
    const [jobData, setJobData] = useState({});
    const [remarkText, setRemarkText] = useState('');
    const [is_seized, setIs_seized] = useState(0);

    useEffect(() => {
        setIsChange(0);
        fetchData({
            role: currentUser ? `/${currentUser.role}` : "/guest",
            type: `jobs/${id}`,
            method: "GET",
            onSuccess: (data) => {
                setJobData(data);
                setIs_seized(data.is_seized);
            },
            onError: (err) => console.error(`Failed to fetch applications: ${err}`),
            logOut,
        });
    }, [is_seized]);

    useEffect(() => {
        setIsChange(0);
        fetchData({
            role: currentUser ? `/${currentUser.role}` : "/guest",
            type: `job_applications/${id}`,
            method: "GET",
            onSuccess: (data) => {
                setApplicants(data);
            },
            onError: (err) => console.error(`Failed to fetch applications: ${err}`),
            logOut,
        });
    }, [isChange, is_seized]);

    const openEmailModal = (applicant) => {
        setSelectedApplicant(applicant);
        setEmailSubject(`About your application to Job #${id}`);
        setEmailBody('');
        setShowEmailModal(true);
    };

    const handleSendEmail = async () => {
        try {
            await fetchData({
                role: currentUser ? `/${currentUser.role}` : "/guest",
                type: `job_applications/notify`,
                method: 'PUT',
                body: {
                    user_id: selectedApplicant.id,
                    email: selectedApplicant.email,
                    title: emailSubject,
                    content: emailBody
                },
                onSuccess: () => {
                    setShowEmailModal(false);
                    setSelectedApplicant(null);
                    setEmailSubject('');
                    setEmailBody('');
                    Swal.fire({
                        icon: 'success',
                        title: 'Email sent successfully',
                        showConfirmButton: false,
                        timer: 2000
                    });
                },
                onError: (error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Failed to send email!'
                    });
                }
            });
        } catch (error) {
            alert("Error sending email");
        }
    };

    const handleRemarkModal = async (applicant, isEditing = false) => {
        const { value: remark } = await Swal.fire({
            title: isEditing ? 'Edit Remark' : 'Add Remark',
            input: 'textarea',
            inputLabel: `Add Remark`,
            inputValue: applicant.remark || '',
            inputPlaceholder: 'Type your remark here...',
            inputAttributes: {
                'aria-label': 'Type your remark here'
            },
            showCancelButton: true,
            confirmButtonText: isEditing ? 'Save' : 'Add',
            cancelButtonText: 'Cancel'
        });

        if (remark !== undefined) {
            submitRemark(applicant, remark);
        }
    };

    const submitRemark = async (applicant, remark) => {
        try {
            await fetchData({
                role: currentUser ? `/${currentUser.role}` : "/guest",
                type: `job_applications/${id}`,
                method: 'PUT',
                body: { remark: remark, user_id: applicant.id },
                onSuccess: (result) => {
                    setIsChange(1);
                },
                onError: (error) => {

                }
            });
        } catch (error) {
            alert(error);
        }
    };

    const handleDeleteJob = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'This job will be permanently deleted.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await fetchData({
                    role: currentUser ? `/${currentUser.role}` : "/guest",
                    type: `jobs/${id}`,
                    method: 'delete',
                    onSuccess: (result) => {
                        navigate('/home')
                    },
                    onError: (error) => {
                    }
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Deleted faild!',
                    text: 'The job has been not deleted.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        };

    };

    const handleMarkAsFilled = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `This work will be signed as ${is_seized ? 'not' : ''} seized.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, mark it!',
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                await fetchData({
                    role: currentUser ? `/${currentUser.role}` : "/guest",
                    type: `jobs/${id}`,
                    method: 'put',
                    body: { is_seized: !is_seized },
                    onSuccess: (result) => {
                        setIs_seized((prev) => !prev)
                        setIsChange(1);
                    },
                    onError: (error) => {
                    }
                });
            } catch (error) {

            }
        };

    };

    const handleReject = async (applicant) => {
        try {
            await fetchData({
                role: currentUser ? `/${currentUser.role}` : "/guest",
                type: `job_applications/reject/${id}`,
                method: 'put',
                body: { developerEmail: applicant.email, developerId: applicant.id },
                onSuccess: (result) => {
                    setIsChange(1);
                },
                onError: (error) => {
                }
            });
        } catch (error) {
            alert(error);
        }
    }

    const handleStatus = async (applicant, status) => {
        try {
            await fetchData({
                role: currentUser ? `/${currentUser.role}` : "/guest",
                type: `job_applications/${id}`,
                method: 'put',
                body: { is_treated: status, user_id: applicant.id },
                onSuccess: (result) => {
                    setIsChange(1);
                },
                onError: (error) => {
                }
            });
        } catch (error) {
            alert(error);
        }
    }

    return (
        <div className="container">
            <div className="header">
                <h2 className="title">Applicants for this position</h2>
                <div className="jobActions">
                    <Update
                        className='update-job-btn'
                        type="jobs"
                        itemId={id}
                        setIsChange={setIsChange}
                        inputs={["title", "company_name", "details", "requirements", "experience", "languages"]}
                        role={`/${currentUser.role}`}
                        initialData={jobData}
                    />
                    <button className="button filledButton" onClick={handleMarkAsFilled}>{is_seized ? 'Mark as not caught' : 'Mark as caught'}</button>
                    <button className="button deleteButton" onClick={handleDeleteJob}>Delete Job</button>
                </div>
            </div>

            {applicants.length === 0 ? (
                <div className="noApplicants">There are no applicants for this job yet.</div>
            ) : (
                <div className="applicantsGrid">
                    {applicants.map((applicant, index) => (
                        <div className="applicantCard" key={index}>
                            <div className="cardHeader">
                                <div className="profileSection">
                                    <img src={applicant.profile_image} alt="Profile" className="profileImage" />
                                    <div className="profileInfo">
                                        <h3 className="username">{applicant.name}</h3>
                                        <div className="role">
                                            <span className="smallIcon">👤</span>
                                            <Link to={`/${applicant.username}/profile`}>View Developer</Link>
                                        </div>
                                        <div className="rating">
                                            <span className="smallIcon">⭐</span>
                                            {applicant.rating}
                                        </div>
                                    </div>
                                </div>
                                <div className={`statusBadge ${applicant.is_treated}`}>
                                    {applicant.is_treated}
                                </div>
                            </div>

                            <div className="skillsSection">
                                {(applicant.languages ?? "")
                                    .split(",")
                                    .map((skill) => skill.trim())
                                    .filter((skill) => skill)
                                    .map((skill, index) => (
                                        <span key={index} className="skill-tag">
                                            {skill}
                                        </span>
                                    ))}
                            </div>

                            <div className="contactInfo">
                                Email: {applicant.email}<br />
                                Phone: {applicant.phone}
                            </div>

                            {applicant.remark && (
                                <div className="remarkSection">{applicant.remark}</div>
                            )}

                            <div className="cardActions">
                                <div className="actionRow">
                                    <button className="smallButton handleButton" disabled={is_seized} onClick={() => handleStatus(applicant, 'Handled')}>Handle</button>
                                    <button className="smallButton rejectButton" disabled={is_seized} onClick={() => handleReject(applicant)}>Reject</button>
                                    <button className="smallButton pendingButton" disabled={is_seized} onClick={() => handleStatus(applicant, 'pending')}>pending</button>
                                    <button className="smallButton emailButton" disabled={is_seized} onClick={() => openEmailModal(applicant)}>Send Email</button>
                                </div>
                                <div className="actionRow">
                                    {applicant.cv ? (
                                        <a href={applicant.cv} target="_blank" rel="noopener noreferrer" className="smallButton cvButton">
                                            View CV
                                        </a>
                                    ) : (
                                        <div className="noCv">No CV Available</div>
                                    )}
                                    <button className="smallButton remarkButton" disabled={is_seized} onClick={() => handleRemarkModal(applicant)}>Add Remark</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {showEmailModal && (
                <Modal onClose={() => setShowEmailModal(false)}>
                    <h3>Send Email to {selectedApplicant?.username}</h3>
                    <input
                        type="text"
                        placeholder="Subject"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                    />
                    <input
                        placeholder="Message content"
                        rows="6"
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                    />
                    <div className="modal-actions">
                        <button value="OK" onClick={handleSendEmail}>Send</button>
                        <button value="cancel" onClick={() => setShowEmailModal(false)}>Cancel</button>
                    </div>
                </Modal>
            )}

        </div>
    )
}

export default ApplyUsers;