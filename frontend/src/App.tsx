import { Route, Routes } from "react-router-dom";
import Layout from "./components/common/Layout";
import ChatPage from "./components/Dating/ChatPage";
import DatingPage from "./components/Dating/DatingPage";
import FeedPage from "./components/Feed/FeedPage";
import ProfilePage from "./components/Profile/ProfilePage";
import VacanciesPage from "./components/Vacancies/VacanciesPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout title="HstlGram">
            <FeedPage />
          </Layout>
        }
      />
      <Route
        path="/dating"
        element={
          <Layout title="Знакомства">
            <DatingPage />
          </Layout>
        }
      />
      <Route path="/dating/chat/:matchId" element={<ChatPage />} />
      <Route
        path="/vacancies"
        element={
          <Layout title="Вакансии">
            <VacanciesPage />
          </Layout>
        }
      />
      <Route
        path="/profile"
        element={
          <Layout title="Профиль">
            <ProfilePage />
          </Layout>
        }
      />
    </Routes>
  );
}
