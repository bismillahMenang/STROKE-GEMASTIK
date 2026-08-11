import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import PatientDetail from './pages/PatientDetail';
import PatientList from './pages/PatientList';
import './App.css';

function ProtectedRoute({ children }) {
  return localStorage.getItem('pulihtrack_therapist_token') ? children : <Navigate replace to="/login" />;
}

export default function App() {
  return <BrowserRouter><Routes><Route element={<Login />} path="/login" /><Route element={<ProtectedRoute><PatientList /></ProtectedRoute>} path="/patients" /><Route element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} path="/patients/:patientId" /><Route element={<Navigate replace to="/patients" />} path="*" /></Routes></BrowserRouter>;
}
