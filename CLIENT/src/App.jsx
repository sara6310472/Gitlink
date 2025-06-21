import { Route, Routes } from "react-router-dom";
import NavBar from "./components/common/NavBar.jsx";
import LogIn from "./components/forms/LogIn";
import Register from "./components/forms/Register";
import Home from "./components/pages/Home";
import Developers from "./components/pages/Developers";
import Recruiters from "./components/pages/Recruiters";
import Jobs from "./components/pages/Jobs";
import Apply from "./components/pages/ApplyUsers";
import Projects from "./components/pages/Projects";
import Error from "./components/pages/Error";
import Profile from "./components/pages/Profile";
import Admin from "./components/pages/Admin.jsx";
import "./style/App.css";
import { CurrentUserProvider } from "./context.jsx";

function App() {
  return (
    <CurrentUserProvider>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/recruiters" element={<Recruiters />} />
        <Route path="/jobs" element={<Jobs />} />

        <Route path="/:username">
          <Route path="home" element={<Home />} />
          <Route path="developers" element={<Developers />} />
          <Route path="jobs" element={<Jobs />}>
            <Route path=":id" element={<Jobs />} />
          </Route>
          <Route path="jobs/:id/apply" element={<Apply />} />
          <Route path="projects" element={<Projects />}>
            <Route path=":id" element={<Projects />} />
          </Route>
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route path="users" element={<Admin />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </CurrentUserProvider>
  );
}

export default App;
