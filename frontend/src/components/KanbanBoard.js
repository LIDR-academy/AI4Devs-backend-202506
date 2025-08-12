import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Spinner, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    getKanbanDataWithCache, 
    getKanbanStatistics,
    validateKanbanData,
    handleKanbanError,
    clearKanbanCache
} from '../services/kanbanService';
import KanbanColumn from './KanbanColumn';

/**
 * Componente principal del tablero Kanban
 * Muestra el estado de los candidatos a través de las etapas de entrevista
 */
const KanbanBoard = () => {
    const { positionId } = useParams();
    const navigate = useNavigate();
    
    // Estados del componente
    const [kanbanData, setKanbanData] = useState(null);
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    /**
     * Carga los datos del Kanban
     */
    const loadKanbanData = async (useCache = true) => {
        try {
            setError(null);
            if (!useCache) {
                setRefreshing(true);
            }

            // Cargar datos del Kanban
            const data = await getKanbanDataWithCache(parseInt(positionId), useCache);
            
            // Validar datos antes de establecer el estado
            const validation = validateKanbanData(data);
            if (!validation.isValid) {
                throw new Error(`Datos inválidos: ${validation.errors.join(', ')}`);
            }
            
            setKanbanData(data);

            // Cargar estadísticas en paralelo
            try {
                const stats = await getKanbanStatistics(parseInt(positionId));
                setStatistics(stats);
            } catch (statsError) {
                console.warn('Error loading statistics:', statsError);
                // Las estadísticas son opcionales, no bloquear la UI
            }

        } catch (err) {
            console.error('Error loading kanban data:', err);
            const errorInfo = handleKanbanError(err);
            setError(errorInfo);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /**
     * Maneja la actualización manual de datos
     */
    const handleRefresh = async () => {
        clearKanbanCache(parseInt(positionId));
        await loadKanbanData(false);
    };

    /**
     * Navega de vuelta a la lista de posiciones
     */
    const handleBackToPositions = () => {
        navigate('/positions');
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        if (positionId && !isNaN(positionId)) {
            loadKanbanData();
        } else {
            setError({
                message: 'ID de posición inválido',
                type: 'error',
                canRetry: false
            });
            setLoading(false);
        }
    }, [positionId]);

    // Renderizar estado de carga
    if (loading) {
        return (
            <Container className="mt-4">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Cargando tablero Kanban...</span>
                    </Spinner>
                    <div>Cargando tablero Kanban...</div>
                </div>
            </Container>
        );
    }

    // Renderizar estado de error
    if (error) {
        return (
            <Container className="mt-4">
                <Row>
                    <Col md={8} className="mx-auto">
                        <Alert variant={error.type === 'warning' ? 'warning' : 'danger'}>
                            <Alert.Heading>
                                {error.type === 'warning' ? '⚠️ Configuración Incompleta' : '❌ Error'}
                            </Alert.Heading>
                            <p className="mb-3">{error.message}</p>
                            
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="outline-primary" 
                                    onClick={handleBackToPositions}
                                >
                                    Volver a Posiciones
                                </Button>
                                
                                {error.canRetry && (
                                    <Button 
                                        variant="primary" 
                                        onClick={() => loadKanbanData(false)}
                                        disabled={refreshing}
                                    >
                                        {refreshing ? 'Reintentando...' : 'Reintentar'}
                                    </Button>
                                )}
                            </div>
                        </Alert>
                    </Col>
                </Row>
            </Container>
        );
    }

    // Renderizar tablero Kanban
    return (
        <Container fluid className="kanban-board mt-3">
            {/* Header del tablero */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={handleBackToPositions}
                                className="me-3"
                            >
                                ← Volver
                            </Button>
                            <h2 className="d-inline mb-0 text-white">
                                Tablero Kanban: {kanbanData.position.title}
                            </h2>
                        </div>
                        
                        <div className="d-flex align-items-center gap-3">
                            {/* Estadísticas rápidas */}
                            {statistics && (
                                <div className="d-flex gap-2">
                                    <Badge bg="info">
                                        {statistics.totalCandidates} candidatos
                                    </Badge>
                                    <Badge bg="success">
                                        {statistics.completedInterviews} completados
                                    </Badge>
                                    {statistics.averageScore && (
                                        <Badge bg="warning">
                                            Promedio: {statistics.averageScore.toFixed(1)}★
                                        </Badge>
                                    )}
                                </div>
                            )}
                            
                            {/* Botón de actualizar */}
                            <Button 
                                variant="outline-primary" 
                                size="sm"
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                {refreshing ? (
                                    <>
                                        <Spinner 
                                            animation="border" 
                                            size="sm" 
                                            className="me-1"
                                        />
                                        Actualizando...
                                    </>
                                ) : (
                                    '🔄 Actualizar'
                                )}
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Información de la posición */}
            <Row className="mb-3">
                <Col>
                    <div className="bg-light p-3 rounded">
                        <Row>
                            <Col md={3}>
                                <small className="text-muted">Empresa:</small>
                                <div className="fw-bold">
                                    {kanbanData.position.company?.name || 'No especificada'}
                                </div>
                            </Col>
                            <Col md={3}>
                                <small className="text-muted">Ubicación:</small>
                                <div className="fw-bold">
                                    {kanbanData.position.location || 'No especificada'}
                                </div>
                            </Col>
                            <Col md={3}>
                                <small className="text-muted">Estado:</small>
                                <div className="fw-bold">
                                    <Badge bg="success">{kanbanData.position.status}</Badge>
                                </div>
                            </Col>
                            <Col md={3}>
                                <small className="text-muted">Etapas:</small>
                                <div className="fw-bold">
                                    {kanbanData.columns.length} configuradas
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>

            {/* Tablero Kanban - Columnas */}
            <div className="kanban-columns">
                {kanbanData.columns.map((column, index) => (
                    <div 
                        key={column.stepId || `column-${index}`}
                        className="kanban-column-container"
                    >
                        <KanbanColumn 
                            column={column}
                            isFirstColumn={index === 0}
                            isLastColumn={index === kanbanData.columns.length - 1}
                            onCandidateClick={(candidate) => {
                                // TODO: Implementar modal de detalles del candidato
                                console.log('Clicked candidate:', candidate);
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Mensaje si no hay candidatos */}
            {kanbanData.columns.every(col => col.candidates.length === 0) && (
                <Row className="mt-4">
                    <Col>
                        <Alert variant="info" className="text-center">
                            <h5>📋 No hay candidatos en esta posición</h5>
                            <p className="mb-0">
                                Los candidatos aparecerán aquí una vez que comiencen a aplicar 
                                y avancen a través del proceso de entrevista.
                            </p>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Footer con información adicional */}
            <Row className="mt-4 mb-3">
                <Col>
                    <div className="text-muted small text-center">
                        <div>
                            Última actualización: {new Date().toLocaleString('es-ES')}
                        </div>
                        {statistics && statistics.lastInterviewDate && (
                            <div>
                                Última entrevista: {new Date(statistics.lastInterviewDate).toLocaleString('es-ES')}
                            </div>
                        )}
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default KanbanBoard;
