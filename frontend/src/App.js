import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './kanban.css'; // Estilos personalizados del Kanban
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidate from './components/AddCandidateForm'; // Asegúrate de tener este componente
import KanbanBoard from './components/KanbanBoard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/positions" element={<RecruiterDashboard />} />
        <Route path="/positions/:positionId/kanban" element={<KanbanBoard />} />
        <Route path="/add-candidate" element={<AddCandidate />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;