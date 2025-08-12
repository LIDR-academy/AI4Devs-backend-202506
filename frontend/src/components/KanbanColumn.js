import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { getColumnStatus } from '../services/kanbanService';
import CandidateCard from './CandidateCard';

/**
 * Componente que representa una columna individual del tablero Kanban
 * @param {Object} column - Datos de la columna con candidatos
 * @param {boolean} isFirstColumn - Si es la primera columna (Aplicación)
 * @param {boolean} isLastColumn - Si es la última columna
 * @param {Function} onCandidateClick - Callback cuando se hace click en un candidato
 */
const KanbanColumn = ({ 
    column, 
    isFirstColumn = false, 
    isLastColumn = false, 
    onCandidateClick 
}) => {
    const columnStatus = getColumnStatus(column.name, column.candidates.length);

    return (
        <div className="kanban-column-wrapper h-100">
            <Card className={`${columnStatus.columnClass} h-100`}>
                {/* Header de la columna */}
                <Card.Header className="kanban-column-header">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <h6 className="mb-0 me-2">
                                {isFirstColumn && '📝 '}
                                {isLastColumn && '✅ '}
                                {!isFirstColumn && !isLastColumn && '🎯 '}
                                {column.name}
                            </h6>
                            
                            {/* Descripción de la etapa si existe */}
                            {column.description && (
                                <small 
                                    className="text-muted ms-1" 
                                    title={column.description}
                                >
                                    ℹ️
                                </small>
                            )}
                        </div>
                        
                        {/* Badge con número de candidatos */}
                        <Badge className={columnStatus.badgeClass}>
                            {column.candidates.length}
                        </Badge>
                    </div>
                    
                    {/* Información adicional de la etapa */}
                    <div className="mt-1">
                        <small className="text-muted">
                            {column.name || 'Etapa sin nombre'}
                            {column.estimatedDuration && (
                                <span className="ms-1">
                                    • ~{column.estimatedDuration} días
                                </span>
                            )}
                        </small>
                    </div>
                </Card.Header>

                {/* Cuerpo de la columna con candidatos */}
                <Card.Body className="kanban-column-body p-2">
                    {column.candidates.length > 0 ? (
                        <div className="kanban-candidates-container">
                            {column.candidates.map((candidate, index) => (
                                <div 
                                    key={candidate.applicationId || `candidate-${index}`}
                                    className="mb-2"
                                >
                                    <CandidateCard 
                                        candidate={candidate}
                                        columnType={isFirstColumn ? 'application' : 'interview'}
                                        onClick={() => onCandidateClick && onCandidateClick(candidate)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Estado vacío */
                        <div className="kanban-empty-state text-center py-4">
                            <div className="text-muted">
                                {isFirstColumn ? (
                                    <>
                                        <div className="mb-2">📭</div>
                                        <small>No hay aplicaciones</small>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-2">👥</div>
                                        <small>No hay candidatos en esta etapa</small>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </Card.Body>

                {/* Footer de la columna con estadísticas */}
                {column.candidates.length > 0 && (
                    <Card.Footer className="kanban-column-footer bg-light py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                {column.candidates.length} candidato{column.candidates.length !== 1 ? 's' : ''}
                            </small>
                            
                            {/* Promedio de scores si aplica */}
                            {!isFirstColumn && column.candidates.some(c => c.averageScore > 0) && (
                                <small className="text-muted">
                                    Promedio: {
                                        (column.candidates
                                            .filter(c => c.averageScore > 0)
                                            .reduce((sum, c) => sum + c.averageScore, 0) / 
                                         column.candidates.filter(c => c.averageScore > 0).length
                                        ).toFixed(1)
                                    }★
                                </small>
                            )}
                            
                            {/* Indicador de actividad reciente */}
                            {column.candidates.some(c => {
                                if (!c.lastInterviewDate) return false;
                                const daysSince = (new Date() - new Date(c.lastInterviewDate)) / (1000 * 60 * 60 * 24);
                                return daysSince <= 7;
                            }) && (
                                <small className="text-success">
                                    🟢 Actividad reciente
                                </small>
                            )}
                        </div>
                    </Card.Footer>
                )}
            </Card>

            {/* Estilos CSS en línea para esta columna */}
            <style jsx>{`
                .kanban-column-wrapper {
                    min-height: 400px;
                }
                
                .kanban-column {
                    border: 2px solid #e9ecef;
                    transition: all 0.3s ease;
                }
                
                .kanban-column:hover {
                    border-color: #007bff;
                    box-shadow: 0 4px 8px rgba(0,123,255,0.1);
                }
                
                .kanban-column-application {
                    border-left: 4px solid #17a2b8;
                }
                
                .kanban-column-interview {
                    border-left: 4px solid #007bff;
                }
                
                .kanban-column-header {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-bottom: 1px solid #dee2e6;
                }
                
                .kanban-column-body {
                    background-color: #fdfdfd;
                    max-height: 500px;
                    overflow-y: auto;
                }
                
                .kanban-candidates-container {
                    min-height: 50px;
                }
                
                .kanban-empty-state {
                    opacity: 0.6;
                    font-style: italic;
                }
                
                .kanban-column-footer {
                    font-size: 0.75rem;
                    border-top: 1px solid #dee2e6;
                }
                
                /* Scrollbar personalizado para la lista de candidatos */
                .kanban-column-body::-webkit-scrollbar {
                    width: 4px;
                }
                
                .kanban-column-body::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 2px;
                }
                
                .kanban-column-body::-webkit-scrollbar-thumb {
                    background: #c1c1c1;
                    border-radius: 2px;
                }
                
                .kanban-column-body::-webkit-scrollbar-thumb:hover {
                    background: #a1a1a1;
                }
            `}</style>
        </div>
    );
};

export default KanbanColumn;
