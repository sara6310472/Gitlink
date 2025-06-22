import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth.js";
import '../../style/LogIn.css';

const VALIDATION_RULES = {
  username: {
    required: "Username is required",
    minLength: {
      value: 3,
      message: "Username must be at least 3 characters"
    }
  },
  password: {
    required: "Password is required",
    minLength: {
      value: 6,
      message: "Password must be at least 6 characters"
    }
  }
};

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm({
    mode: 'onBlur'
  });

  const {
    login,
    isLoading,
    message,
    forgotPassword,
    forgotPasswordLoading,
    forgotPasswordMessage
  } = useAuth();

  const username = watch("username");

  const onSubmit = async (data) => {
    await login({
      username: data.username,
      password: data.password,
    });
    reset();
  };

  const handleForgotPassword = () => {
    forgotPassword(username);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome Back</h2>
          <p className="login-subtitle">Sign in to your GitLink account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <input
              type="text"
              name="username"
              placeholder="Username"
              className={`form-input ${errors.username ? 'error' : ''}`}
              {...register("username", VALIDATION_RULES.username)}
            />
            {errors.username && (
              <span className="error-message">{errors.username.message}</span>
            )}
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              {...register("password", VALIDATION_RULES.password)}
            />
            {errors.password && (
              <span className="error-message">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={`login-btn ${isLoading ? "loading" : ""}`}
            disabled={isLoading || hasErrors}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </button>

          <div className="forgot-password-link">
            <button
              type="button"
              className={`link-btn ${forgotPasswordLoading ? "loading" : ""}`}
              onClick={handleForgotPassword}
              disabled={forgotPasswordLoading}
            >
              {forgotPasswordLoading ? "Sending..." : "Forgot your password?"}
            </button>
          </div>

          {message && (
            <div className={`response-message ${message.includes('successful') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {forgotPasswordMessage && (
            <div className={`response-message ${forgotPasswordMessage.includes('successfully') ? 'success' : 'error'}`}>
              {forgotPasswordMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;