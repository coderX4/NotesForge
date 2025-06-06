import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import { HomeLayout, LoginForm, Home_Register, Aboutus, Contact } from './components/global/globalindex.js';
import {DashboardLayout, MainSection, Subject, FilesUpload, ImportedSubject} from './components/dashboard/dashboardindex.js';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import {AuthProvider} from "./components/AuthContext.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import SubjectContent from "./components/global/sections/SubjectContent.jsx";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<HomeLayout />}>
                <Route path="" element={<Home_Register />} />
                <Route path="aboutus" element={<Aboutus />} />
                <Route path="contactus" element={<Contact />} />
                <Route path="signin" element={<LoginForm />} />
                <Route path="sharedSubject/:subId" element={<SubjectContent />} />
            </Route>

            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route index element={<MainSection />} />
                <Route path="mainsection" element={<MainSection />} />
                <Route path="importSubject" element={<ImportedSubject />} />
                <Route path="subject/:subid" element={<Subject />} />
                <Route path="topic/:unitid/:topicid" element={<FilesUpload />} />
            </Route>

        </>
    )
);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
                <RouterProvider router={router} />
            </GoogleOAuthProvider>
        </AuthProvider>
    </StrictMode>
);
