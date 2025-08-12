import React from 'react';
import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { 
    formatSalary, 
    formatDate, 
    getPositionStatusInfo 
} from '../services/positionService';

/**
 * Componente que muestra una tarjeta individual de posición
 * @param {Object} position - Objeto de posición con toda la información
 * @param {Function} onViewDetails - Función callback para ver detalles
 * @param {Function} onEdit - Función callback para editar
 * @param {Function} onViewKanban - Función callback para ver tablero Kanban
 * @param {boolean} kanbanAvailable - Si el Kanban está disponible para esta posición
 * @param {string} kanbanMessage - Mensaje sobre el estado del Kanban
 */
const PositionCard = ({ 
    position, 
    onViewDetails, 
    onEdit, 
    onViewKanban, 
    kanbanAvailable = false, 
    kanbanMessage 
}) => {
    const statusInfo = getPositionStatusInfo(position.status);
    
    // Calcular rango de salario
    const salaryRange = position.salaryMin && position.salaryMax 
        ? `${formatSalary(position.salaryMin)} - ${formatSalary(position.salaryMax)}`
        : position.salaryMin 
            ? `Desde ${formatSalary(position.salaryMin)}`
            : 'Salario no especificado';

    return (
        <Card className="position-card mb-3 shadow-sm h-100">
            <Card.Header className="bg-light">
                <Row className="align-items-center">
                    <Col>
                        <h5 className="mb-0 text-primary">{position.title}</h5>
                    </Col>
                    <Col xs="auto">
                        <Badge className={statusInfo.className}>
                            {statusInfo.text}
                        </Badge>
                    </Col>
                </Row>
            </Card.Header>
            
            <Card.Body className="d-flex flex-column">
                <Row className="mb-2">
                    <Col xs={6}>
                        <small className="text-muted">Empresa:</small>
                        <div className="fw-bold">
                            {position.company?.name || 'No especificada'}
                        </div>
                    </Col>
                    <Col xs={6}>
                        <small className="text-muted">Ubicación:</small>
                        <div className="fw-bold">
                            {position.location || 'No especificada'}
                        </div>
                    </Col>
                </Row>

                <Row className="mb-2">
                    <Col xs={6}>
                        <small className="text-muted">Tipo de empleo:</small>
                        <div className="fw-bold">
                            {position.employmentType || 'No especificado'}
                        </div>
                    </Col>
                    <Col xs={6}>
                        <small className="text-muted">Salario:</small>
                        <div className="fw-bold text-success">
                            {salaryRange}
                        </div>
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col>
                        <small className="text-muted">Descripción:</small>
                        <div className="text-truncate" title={position.description}>
                            {position.description || 'Sin descripción'}
                        </div>
                    </Col>
                </Row>

                {position.applicationDeadline && (
                    <Row className="mb-3">
                        <Col>
                            <small className="text-muted">Fecha límite de aplicación:</small>
                            <div className="fw-bold text-warning">
                                {formatDate(position.applicationDeadline)}
                            </div>
                        </Col>
                    </Row>
                )}

                <div className="mt-auto">
                    <Row className="g-2">
                        <Col>
                            <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => onViewDetails(position.id)}
                                className="w-100"
                            >
                                Ver Detalles
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                                variant={kanbanAvailable ? "primary" : "outline-secondary"}
                                size="sm" 
                                onClick={() => onViewKanban(position.id)}
                                className="w-100"
                                disabled={!kanbanAvailable}
                                title={kanbanAvailable ? 
                                    "Ver tablero Kanban de candidatos" : 
                                    kanbanMessage || "Kanban no disponible para esta posición"
                                }
                            >
                                {kanbanAvailable ? '📋 Kanban' : '📋 Kanban'}
                                {!kanbanAvailable && (
                                    <small className="d-block" style={{ fontSize: '0.6rem' }}>
                                        No disponible
                                    </small>
                                )}
                            </Button>
                        </Col>
                        <Col>
                            <Button 
                                variant="outline-secondary" 
                                size="sm" 
                                onClick={() => onEdit(position.id)}
                                className="w-100"
                            >
                                Editar
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Card.Body>
        </Card>
    );
};

export default PositionCard;
