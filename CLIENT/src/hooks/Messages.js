import { useState, useEffect, useCallback } from "react";
import { useFetchData } from "../hooks/fetchData.js";
import { useCurrentUser } from "../context.jsx";

export const useMessages = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isChange, setIsChange] = useState(0);
    const [error, setError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const fetchData = useFetchData();

    const { currentUser, setCurrentUser } = useCurrentUser();

    const fetchMessages = useCallback(() => {
        setLoading(true);
        setIsChange(0);
        setCurrentUser(prevUser => ({
            ...prevUser,
            initiatedAction: false
        }));
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages`,
            method: "GET",
            params: { email: currentUser.email },
            onSuccess: (data) => {
                setMessages(data);
                setLoading(false);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role, currentUser.initiatedAction]);

    const hasUnread = messages?.some((msg) => !msg.is_read);

    const markAllAsRead = () => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: "messages",
            method: "PUT",
            body: { is_read: true, email: currentUser.email },
            onSuccess: () => {
                setLoading(false);
                setIsChange(true);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    };

    const markMessageAsRead = useCallback((messageId) => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages/${messageId}`,
            method: "PUT",
            body: { is_read: true, email: currentUser.email },
            onSuccess: () => {
                setLoading(false);
                setIsChange(true);
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role]);

    useEffect(() => {
        if (currentUser.email) {
            fetchMessages();
        }
    }, [isChange, currentUser.email, currentUser.initiatedAction]);

    const deleteMessage = useCallback((id) => {
        setLoading(true);
        fetchData({
            role: `/${currentUser.role}`,
            type: `messages/${id}`,
            method: "DELETE",
            params: { email: currentUser.email },
            onSuccess: (data) => {
                setLoading(false);
                setIsChange(true);
                data;
            },
            onError: (errMsg) => {
                setError(errMsg);
                setLoading(false);
            },
        });
    }, [currentUser.email, currentUser.role]);

    return {
        messages,
        hasUnread,
        markAllAsRead,
        markMessageAsRead,
        loading,
        error,
        isVisible,
        setIsVisible,
        deleteMessage,
    };
};