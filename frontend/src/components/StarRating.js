import React from 'react';
import { renderStarRating } from '../services/kanbanService';

/**
 * Componente que renderiza estrellas para mostrar calificaciones
 * @param {number} score - Puntuación del 0 al 5
 * @param {string} size - Tamaño de las estrellas ('sm', 'md', 'lg')
 * @param {boolean} showNumber - Si mostrar el número junto a las estrellas
 * @param {boolean} interactive - Si las estrellas son interactivas (para futuras funcionalidades)
 * @param {Function} onChange - Callback cuando cambia la puntuación (modo interactivo)
 */
const StarRating = ({ 
    score = 0, 
    size = 'md', 
    showNumber = true, 
    interactive = false, 
    onChange 
}) => {
    const stars = renderStarRating(score);
    
    // Definir tamaños de estrellas
    const sizes = {
        sm: '0.75rem',
        md: '1rem',
        lg: '1.25rem'
    };

    const starSize = sizes[size] || sizes.md;

    /**
     * Maneja el click en una estrella (modo interactivo)
     */
    const handleStarClick = (starValue) => {
        if (interactive && onChange) {
            onChange(starValue);
        }
    };

    /**
     * Renderiza una estrella individual
     */
    const renderStar = (star) => {
        let starIcon;
        let starColor;

        if (star.filled) {
            starIcon = '★';
            starColor = '#ffc107'; // Amarillo dorado
        } else if (star.halfFilled) {
            starIcon = '☆'; // Para media estrella usaremos combinación CSS
            starColor = '#ffc107';
        } else {
            starIcon = '☆';
            starColor = '#e9ecef'; // Gris claro
        }

        return (
            <span
                key={star.id}
                className={`star ${interactive ? 'star-interactive' : ''}`}
                onClick={() => handleStarClick(star.id)}
                style={{
                    color: starColor,
                    fontSize: starSize,
                    cursor: interactive ? 'pointer' : 'default',
                    transition: 'color 0.2s ease',
                    userSelect: 'none'
                }}
                title={interactive ? `Calificar con ${star.id} estrella${star.id !== 1 ? 's' : ''}` : `${score} de 5 estrellas`}
            >
                {star.halfFilled ? (
                    <span style={{ position: 'relative' }}>
                        <span style={{ color: '#e9ecef' }}>☆</span>
                        <span 
                            style={{ 
                                position: 'absolute', 
                                left: 0, 
                                width: '50%', 
                                overflow: 'hidden',
                                color: '#ffc107'
                            }}
                        >
                            ★
                        </span>
                    </span>
                ) : (
                    starIcon
                )}
            </span>
        );
    };

    return (
        <div className="star-rating d-inline-flex align-items-center">
            {/* Contenedor de estrellas */}
            <div className="stars-container me-1">
                {stars.map(renderStar)}
            </div>
            
            {/* Número de puntuación */}
            {showNumber && (
                <span 
                    className="score-number text-muted"
                    style={{ fontSize: size === 'sm' ? '0.75rem' : '0.85rem' }}
                >
                    ({score.toFixed(1)})
                </span>
            )}

            {/* Estilos CSS en línea */}
            <style jsx>{`
                .star-rating {
                    line-height: 1;
                }
                
                .stars-container {
                    display: inline-flex;
                    align-items: center;
                    gap: 1px;
                }
                
                .star {
                    display: inline-block;
                    line-height: 1;
                }
                
                .star-interactive:hover {
                    color: #ffb400 !important;
                    transform: scale(1.1);
                }
                
                .score-number {
                    white-space: nowrap;
                    font-weight: 500;
                }
                
                /* Variaciones de tamaño */
                .star-rating.size-sm .stars-container {
                    gap: 0.5px;
                }
                
                .star-rating.size-lg .stars-container {
                    gap: 2px;
                }
                
                /* Estados especiales */
                .star-rating.high-score .score-number {
                    color: #28a745 !important;
                }
                
                .star-rating.medium-score .score-number {
                    color: #ffc107 !important;
                }
                
                .star-rating.low-score .score-number {
                    color: #dc3545 !important;
                }
                
                /* Accesibilidad */
                .star-interactive {
                    outline: none;
                }
                
                .star-interactive:focus {
                    outline: 2px solid #007bff;
                    outline-offset: 2px;
                    border-radius: 2px;
                }
                
                /* Responsive */
                @media (max-width: 576px) {
                    .stars-container {
                        gap: 0px;
                    }
                    
                    .score-number {
                        font-size: 0.7rem !important;
                    }
                }
            `}</style>
        </div>
    );
};

/**
 * Componente simplificado para mostrar solo estrellas sin número
 */
export const StarsOnly = ({ score, size = 'sm' }) => (
    <StarRating score={score} size={size} showNumber={false} />
);

/**
 * Componente para calificación interactiva (para futuras funcionalidades)
 */
export const InteractiveStarRating = ({ score, onChange, size = 'md' }) => (
    <StarRating 
        score={score} 
        size={size} 
        interactive={true} 
        onChange={onChange}
        showNumber={true}
    />
);

export default StarRating;
