import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { 
    formatScore, 
    getScoreColor, 
    formatLastInterviewDate 
} from '../services/kanbanService';
import StarRating from './StarRating';

/**
 * Componente que representa una tarjeta de candidato en el tablero Kanban
 * @param {Object} candidate - Datos del candidato
 * @param {string} columnType - Tipo de columna ('application' o 'interview')
 * @param {Function} onClick - Callback cuando se hace click en la tarjeta
 */
const CandidateCard = ({ candidate, columnType = 'interview', onClick }) => {
    const hasScore = candidate.averageScore && candidate.averageScore > 0;
    const isApplicationColumn = columnType === 'application';

    return (
        <Card 
            className="candidate-card shadow-sm"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <Card.Body className="p-3">
                {/* Header con nombre y score */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="candidate-info flex-grow-1">
                        <h6 className="candidate-name mb-1">
                            {candidate.candidateName || 'Candidato sin nombre'}
                        </h6>
                        
                        {/* Email del candidato */}
                        {candidate.candidateEmail && (
                            <div className="candidate-email text-muted small">
                                📧 {candidate.candidateEmail}
                            </div>
                        )}
                    </div>
                    
                    {/* Score con estrellas - solo si no es columna de aplicación */}
                    {!isApplicationColumn && hasScore && (
                        <div className="candidate-score text-end">
                            <div className="d-flex align-items-center">
                                <StarRating 
                                    score={candidate.averageScore} 
                                    size="sm"
                                    showNumber={false}
                                />
                                <span className={`ms-1 fw-bold small ${getScoreColor(candidate.averageScore)}`}>
                                    {formatScore(candidate.averageScore)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Información de la aplicación */}
                <div className="candidate-details">
                    {/* Fecha de aplicación */}
                    {candidate.applicationDate && (
                        <div className="detail-row mb-1">
                            <small className="text-muted">
                                📅 Aplicó: {formatLastInterviewDate(candidate.applicationDate)}
                            </small>
                        </div>
                    )}
                    
                    {/* Última entrevista - solo si no es columna de aplicación */}
                    {!isApplicationColumn && candidate.lastInterviewDate && (
                        <div className="detail-row mb-1">
                            <small className="text-muted">
                                🎤 Última entrevista: {formatLastInterviewDate(candidate.lastInterviewDate)}
                            </small>
                        </div>
                    )}
                    
                    {/* Número de entrevistas completadas */}
                    {!isApplicationColumn && candidate.interviewsCompleted !== undefined && (
                        <div className="detail-row mb-1">
                            <small className="text-muted">
                                ✅ Entrevistas: {candidate.interviewsCompleted}
                                {candidate.totalInterviews && (
                                    <span> / {candidate.totalInterviews}</span>
                                )}
                            </small>
                        </div>
                    )}
                    
                    {/* Etapa actual */}
                    {candidate.currentStep && (
                        <div className="detail-row mb-2">
                            <Badge 
                                bg={isApplicationColumn ? 'info' : 'primary'} 
                                className="current-step-badge"
                            >
                                {candidate.currentStep}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Footer con indicadores de estado */}
                <div className="candidate-footer mt-2 pt-2 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                        {/* Indicador de progreso */}
                        <div className="progress-indicator">
                            {isApplicationColumn ? (
                                <small className="text-info">
                                    📝 Esperando revisión
                                </small>
                            ) : hasScore ? (
                                <small className={getScoreColor(candidate.averageScore)}>
                                    {candidate.averageScore >= 4 ? '🌟 Excelente' :
                                     candidate.averageScore >= 3 ? '👍 Bueno' :
                                     candidate.averageScore >= 2 ? '⚠️ Regular' : '⚡ Necesita mejora'}
                                </small>
                            ) : (
                                <small className="text-muted">
                                    ⏳ En proceso
                                </small>
                            )}
                        </div>
                        
                        {/* Indicador de tiempo */}
                        {candidate.lastInterviewDate && (
                            <div className="time-indicator">
                                {(() => {
                                    const daysSince = Math.floor(
                                        (new Date() - new Date(candidate.lastInterviewDate)) / (1000 * 60 * 60 * 24)
                                    );
                                    
                                    if (daysSince === 0) {
                                        return <small className="text-success">🟢 Hoy</small>;
                                    } else if (daysSince <= 3) {
                                        return <small className="text-warning">🟡 Reciente</small>;
                                    } else if (daysSince <= 7) {
                                        return <small className="text-info">🔵 Esta semana</small>;
                                    } else {
                                        return <small className="text-muted">⚪ Anterior</small>;
                                    }
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </Card.Body>

            {/* Estilos CSS en línea para la tarjeta */}
            <style jsx>{`
                .candidate-card {
                    border: 1px solid #e9ecef;
                    transition: all 0.2s ease;
                    margin-bottom: 0;
                }
                
                .candidate-card:hover {
                    border-color: #007bff;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,123,255,0.15) !important;
                }
                
                .candidate-name {
                    color: #2c3e50;
                    font-weight: 600;
                    font-size: 0.9rem;
                    line-height: 1.2;
                }
                
                .candidate-email {
                    font-size: 0.75rem;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    max-width: 150px;
                }
                
                .candidate-score {
                    min-width: 60px;
                }
                
                .detail-row {
                    font-size: 0.75rem;
                    line-height: 1.3;
                }
                
                .current-step-badge {
                    font-size: 0.65rem;
                    padding: 0.25rem 0.5rem;
                }
                
                .candidate-footer {
                    border-top-color: #f8f9fa !important;
                    border-top-width: 1px !important;
                }
                
                .progress-indicator,
                .time-indicator {
                    font-size: 0.7rem;
                }
                
                /* Estados especiales */
                .candidate-card.high-score {
                    border-left: 3px solid #28a745;
                }
                
                .candidate-card.medium-score {
                    border-left: 3px solid #ffc107;
                }
                
                .candidate-card.low-score {
                    border-left: 3px solid #dc3545;
                }
                
                .candidate-card.no-score {
                    border-left: 3px solid #6c757d;
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .candidate-card {
                        margin-bottom: 0.5rem;
                    }
                    
                    .candidate-name {
                        font-size: 0.85rem;
                    }
                    
                    .candidate-email {
                        font-size: 0.7rem;
                        max-width: 120px;
                    }
                    
                    .detail-row {
                        font-size: 0.7rem;
                    }
                }
            `}</style>
        </Card>
    );
};

export default CandidateCard;
