import React from 'react';
import { Button, Card, Container, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import logo from '../assets/lti-logo.png';
import PositionList from './PositionList';

const RecruiterDashboard = () => {
    return (
        <Container fluid className="mt-4">
            {/* Header con logo y título */}
            <Row className="mb-4">
                <Col className="text-center">
                <img src={logo} alt="LTI Logo" style={{ width: '150px' }} />
                    <h1 className="mt-3">Dashboard del Reclutador</h1>
                </Col>
            </Row>

            {/* Tabs para organizar las funcionalidades */}
            <Tabs defaultActiveKey="positions" id="recruiter-tabs" className="mb-4">
                <Tab eventKey="positions" title="Posiciones Abiertas">
                    <PositionList />
                </Tab>
                
                <Tab eventKey="candidates" title="Gestión de Candidatos">
                    <Row className="justify-content-center">
                        <Col md={8} lg={6}>
                            <Card className="shadow p-4 text-center">
                        <h5 className="mb-4">Añadir Candidato</h5>
                                <p className="text-muted mb-4">
                                    Gestiona los candidatos del sistema. Añade nuevos candidatos, 
                                    revisa perfiles y gestiona aplicaciones.
                                </p>
                        <Link to="/add-candidate">
                                    <Button variant="primary" size="lg" className="px-4">
                                        Añadir Nuevo Candidato
                                    </Button>
                        </Link>
                    </Card>
                </Col>
            </Row>
                </Tab>
                
                <Tab eventKey="overview" title="Resumen General">
                    <Row className="justify-content-center">
                        <Col md={10}>
                            <Row>
                                <Col md={4}>
                                    <Card className="text-center shadow-sm border-primary">
                                        <Card.Body>
                                            <h3 className="text-primary">0</h3>
                                            <p className="text-muted">Posiciones Activas</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center shadow-sm border-success">
                                        <Card.Body>
                                            <h3 className="text-success">0</h3>
                                            <p className="text-muted">Candidatos Totales</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col md={4}>
                                    <Card className="text-center shadow-sm border-warning">
                                        <Card.Body>
                                            <h3 className="text-warning">0</h3>
                                            <p className="text-muted">Aplicaciones Pendientes</p>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default RecruiterDashboard;