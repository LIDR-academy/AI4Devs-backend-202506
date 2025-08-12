import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Pagination, Form, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PositionCard from './PositionCard';
import { getActivePositions, getPositionsWithFilters } from '../services/positionService';
import { checkKanbanHealth } from '../services/kanbanService';

/**
 * Componente que muestra la lista de posiciones con paginación y filtros
 */
const PositionList = () => {
    const navigate = useNavigate();
    const [positions, setPositions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [kanbanStatuses, setKanbanStatuses] = useState({}); // Para almacenar el estado de Kanban de cada posición
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [filters, setFilters] = useState({
        location: '',
        employmentType: ''
    });

    // Cargar posiciones al montar el componente
    useEffect(() => {
        fetchPositions();
    }, [pagination.page, pagination.limit]);

    // Función para obtener posiciones
    const fetchPositions = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let result;
            
            // Si hay filtros aplicados, usar endpoint de filtros
            if (filters.location || filters.employmentType) {
                result = await getPositionsWithFilters(filters, {
                    page: pagination.page,
                    limit: pagination.limit
                });
            } else {
                // Si no hay filtros, usar endpoint básico
                result = await getActivePositions(pagination.page, pagination.limit);
            }

            setPositions(result.data || []);
            setPagination(prev => ({
                ...prev,
                total: result.pagination?.total || 0,
                totalPages: result.pagination?.totalPages || 0
            }));

            // Verificar estado de Kanban para cada posición
            await checkKanbanAvailability(result.data || []);
        } catch (err) {
            setError(err.message);
            setPositions([]);
        } finally {
            setLoading(false);
        }
    };

    // Función para verificar disponibilidad de Kanban para cada posición
    const checkKanbanAvailability = async (positionsList) => {
        const statuses = {};
        
        // Verificar en paralelo el estado de Kanban para cada posición
        const checks = positionsList.map(async (position) => {
            try {
                const health = await checkKanbanHealth(position.id);
                statuses[position.id] = {
                    available: health.canShowKanban,
                    hasInterviewFlow: health.hasValidInterviewFlow,
                    numberOfSteps: health.numberOfSteps,
                    message: health.message
                };
            } catch (error) {
                // Si hay error, asumir que no está disponible
                statuses[position.id] = {
                    available: false,
                    hasInterviewFlow: false,
                    numberOfSteps: 0,
                    message: 'Error verificando estado'
                };
            }
        });

        await Promise.all(checks);
        setKanbanStatuses(statuses);
    };

    // Función para cambiar de página
    const handlePageChange = (newPage) => {
        setPagination(prev => ({
            ...prev,
            page: newPage
        }));
    };

    // Función para cambiar límite de elementos por página
    const handleLimitChange = (newLimit) => {
        setPagination(prev => ({
            ...prev,
            page: 1, // Resetear a primera página
            limit: parseInt(newLimit)
        }));
    };

    // Función para aplicar filtros
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        setPagination(prev => ({ ...prev, page: 1 })); // Resetear a primera página
        fetchPositions();
    };

    // Función para limpiar filtros
    const handleClearFilters = () => {
        setFilters({
            location: '',
            employmentType: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
        // fetchPositions se ejecutará automáticamente por useEffect
    };

    // Callbacks para las acciones de las tarjetas
    const handleViewDetails = (positionId) => {
        console.log('Ver detalles de posición:', positionId);
        // TODO: Implementar navegación a página de detalles
        // navigate(`/positions/${positionId}/details`);
    };

    const handleEdit = (positionId) => {
        console.log('Editar posición:', positionId);
        // TODO: Implementar navegación a página de edición
        // navigate(`/positions/${positionId}/edit`);
    };

    const handleViewKanban = (positionId) => {
        console.log('Ver Kanban de posición:', positionId);
        
        // Verificar si el Kanban está disponible antes de navegar
        const kanbanStatus = kanbanStatuses[positionId];
        
        if (kanbanStatus && kanbanStatus.available) {
            navigate(`/positions/${positionId}/kanban`);
        } else {
            // Mostrar alerta si el Kanban no está disponible
            const message = kanbanStatus?.message || 'Esta posición no tiene configuradas las etapas de entrevista necesarias para mostrar el tablero Kanban.';
            alert(`⚠️ Tablero Kanban no disponible\n\n${message}`);
        }
    };

    // Generar páginas para la paginación
    const generatePaginationItems = () => {
        const items = [];
        const { page, totalPages } = pagination;

        // Página anterior
        items.push(
            <Pagination.Prev
                key="prev"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
            />
        );

        // Páginas numeradas
        for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === page}
                    onClick={() => handlePageChange(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        // Página siguiente
        items.push(
            <Pagination.Next
                key="next"
                disabled={page === totalPages}
                onClick={() => handlePageChange(page + 1)}
            />
        );

        return items;
    };

    return (
        <Container fluid>
            {/* Filtros */}
            <Row className="mb-4">
                <Col>
                    <Card className="shadow-sm">
                        <Card.Header>
                            <h6 className="mb-0">Filtros de Búsqueda</h6>
                        </Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleFilterSubmit}>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ubicación</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ej: Madrid, Barcelona"
                                                value={filters.location}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    location: e.target.value
                                                }))}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Tipo de Empleo</Form.Label>
                                            <Form.Select
                                                value={filters.employmentType}
                                                onChange={(e) => setFilters(prev => ({
                                                    ...prev,
                                                    employmentType: e.target.value
                                                }))}
                                            >
                                                <option value="">Todos los tipos</option>
                                                <option value="Full-time">Tiempo completo</option>
                                                <option value="Part-time">Tiempo parcial</option>
                                                <option value="Contract">Contrato</option>
                                                <option value="Internship">Prácticas</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4} className="d-flex align-items-end">
                                        <div className="d-grid gap-2 d-md-flex">
                                            <Button type="submit" variant="primary" size="sm">
                                                Aplicar Filtros
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="outline-secondary" 
                                                size="sm"
                                                onClick={handleClearFilters}
                                            >
                                                Limpiar
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Controles de paginación superior */}
            <Row className="mb-3">
                <Col md={6}>
                    <div className="d-flex align-items-center">
                        <span className="me-2">Mostrar:</span>
                        <Form.Select
                            size="sm"
                            style={{ width: 'auto' }}
                            value={pagination.limit}
                            onChange={(e) => handleLimitChange(e.target.value)}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </Form.Select>
                        <span className="ms-2">por página</span>
                    </div>
                </Col>
                <Col md={6} className="text-end">
                    <small className="text-muted">
                        Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} posiciones
                    </small>
                </Col>
            </Row>

            {/* Estado de carga */}
            {loading && (
                <Row className="text-center py-5">
                    <Col>
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                        <div className="mt-2">Cargando posiciones...</div>
                    </Col>
                </Row>
            )}

            {/* Estado de error */}
            {error && (
                <Row className="mb-4">
                    <Col>
                        <Alert variant="danger" onClose={() => setError(null)} dismissible>
                            <Alert.Heading>Error al cargar posiciones</Alert.Heading>
                            <p>{error}</p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Lista de posiciones */}
            {!loading && !error && positions.length > 0 && (
                <Row>
                    {positions.map((position) => {
                        const kanbanStatus = kanbanStatuses[position.id];
                        
                        return (
                            <Col key={position.id} lg={6} xl={4} className="mb-3">
                                <PositionCard
                                    position={position}
                                    onViewDetails={handleViewDetails}
                                    onEdit={handleEdit}
                                    onViewKanban={handleViewKanban}
                                    kanbanAvailable={kanbanStatus?.available || false}
                                    kanbanMessage={kanbanStatus?.message}
                                />
                            </Col>
                        );
                    })}
                </Row>
            )}

            {/* Estado vacío */}
            {!loading && !error && positions.length === 0 && (
                <Row className="text-center py-5">
                    <Col>
                        <Alert variant="info">
                            <Alert.Heading>No se encontraron posiciones</Alert.Heading>
                            <p>
                                No hay posiciones activas que coincidan con los criterios de búsqueda.
                                Intenta ajustar los filtros o crear nuevas posiciones.
                            </p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Paginación inferior */}
            {!loading && !error && pagination.totalPages > 1 && (
                <Row className="mt-4">
                    <Col className="d-flex justify-content-center">
                        <Pagination>
                            {generatePaginationItems()}
                        </Pagination>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default PositionList;
