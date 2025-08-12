import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PositionCard from '../PositionCard';

// Mock del servicio
jest.mock('../../services/positionService', () => ({
    formatSalary: jest.fn((salary) => salary ? `${salary}€` : 'No especificado'),
    formatDate: jest.fn((date) => date ? '15 de enero de 2025' : 'No especificada'),
    getPositionStatusInfo: jest.fn((status) => {
        const statusMap = {
            'Active': { text: 'Activa', className: 'badge bg-success' },
            'Draft': { text: 'Borrador', className: 'badge bg-secondary' },
            'Closed': { text: 'Cerrada', className: 'badge bg-danger' }
        };
        return statusMap[status] || { text: 'Desconocido', className: 'badge bg-info' };
    })
}));

describe('PositionCard Component', () => {
    const mockPosition = {
        id: 1,
        title: 'Desarrollador Full Stack',
        company: { name: 'TechCorp' },
        location: 'Madrid',
        status: 'Active',
        isVisible: true,
        employmentType: 'Full-time',
        salaryMin: 35000,
        salaryMax: 45000,
        description: 'Desarrollador con experiencia en React y Node.js'
    };

    const mockCallbacks = {
        onViewDetails: jest.fn(),
        onEdit: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render position information correctly', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('Desarrollador Full Stack')).toBeInTheDocument();
        expect(screen.getByText('TechCorp')).toBeInTheDocument();
        expect(screen.getByText('Madrid')).toBeInTheDocument();
        expect(screen.getByText('Full-time')).toBeInTheDocument();
        expect(screen.getByText('35000€ - 45000€')).toBeInTheDocument();
        expect(screen.getByText('Desarrollador con experiencia en React y Node.js')).toBeInTheDocument();
        expect(screen.getByText('Activa')).toBeInTheDocument();
    });

    it('should render status badge with correct styling', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);

        // Assert
        const statusBadge = screen.getByText('Activa');
        expect(statusBadge).toHaveClass('badge', 'bg-success');
    });

    it('should handle missing company name gracefully', () => {
        // Arrange
        const positionWithoutCompany = { ...mockPosition, company: null };

        // Act
        render(<PositionCard position={positionWithoutCompany} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('No especificada')).toBeInTheDocument();
    });

    it('should handle missing location gracefully', () => {
        // Arrange
        const positionWithoutLocation = { ...mockPosition, location: null };

        // Act
        render(<PositionCard position={positionWithoutLocation} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('No especificada')).toBeInTheDocument();
    });

    it('should handle missing employment type gracefully', () => {
        // Arrange
        const positionWithoutEmploymentType = { ...mockPosition, employmentType: null };

        // Act
        render(<PositionCard position={positionWithoutEmploymentType} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('No especificado')).toBeInTheDocument();
    });

    it('should handle missing description gracefully', () => {
        // Arrange
        const positionWithoutDescription = { ...mockPosition, description: null };

        // Act
        render(<PositionCard position={positionWithoutDescription} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('Sin descripción')).toBeInTheDocument();
    });

    it('should display salary range when both min and max are provided', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('35000€ - 45000€')).toBeInTheDocument();
    });

    it('should display "Desde" when only min salary is provided', () => {
        // Arrange
        const positionWithOnlyMinSalary = { ...mockPosition, salaryMax: null };

        // Act
        render(<PositionCard position={positionWithOnlyMinSalary} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('Desde 35000€')).toBeInTheDocument();
    });

    it('should display "Salario no especificado" when no salary is provided', () => {
        // Arrange
        const positionWithoutSalary = { ...mockPosition, salaryMin: null, salaryMax: null };

        // Act
        render(<PositionCard position={positionWithoutSalary} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('Salario no especificado')).toBeInTheDocument();
    });

    it('should display application deadline when provided', () => {
        // Arrange
        const positionWithDeadline = { 
            ...mockPosition, 
            applicationDeadline: '2025-02-28T00:00:00Z' 
        };

        // Act
        render(<PositionCard position={positionWithDeadline} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('15 de enero de 2025')).toBeInTheDocument();
    });

    it('should not display application deadline section when not provided', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);

        // Assert
        expect(screen.queryByText('Fecha límite de aplicación:')).not.toBeInTheDocument();
    });

    it('should call onViewDetails when "Ver Detalles" button is clicked', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);
        const viewDetailsButton = screen.getByText('Ver Detalles');

        fireEvent.click(viewDetailsButton);

        // Assert
        expect(mockCallbacks.onViewDetails).toHaveBeenCalledWith(1);
    });

    it('should call onEdit when "Editar" button is clicked', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);
        const editButton = screen.getByText('Editar');

        fireEvent.click(editButton);

        // Assert
        expect(mockCallbacks.onEdit).toHaveBeenCalledWith(1);
    });

    it('should render buttons with correct styling', () => {
        // Act
        render(<PositionCard position={mockPosition} {...mockCallbacks} />);

        // Assert
        const viewDetailsButton = screen.getByText('Ver Detalles');
        const editButton = screen.getByText('Editar');

        expect(viewDetailsButton).toHaveClass('btn', 'btn-outline-primary');
        expect(editButton).toHaveClass('btn', 'btn-outline-secondary');
    });

    it('should handle different status types correctly', () => {
        // Arrange
        const draftPosition = { ...mockPosition, status: 'Draft' };

        // Act
        render(<PositionCard position={draftPosition} {...mockCallbacks} />);

        // Assert
        expect(screen.getByText('Borrador')).toBeInTheDocument();
    });

    it('should truncate long descriptions with title attribute', () => {
        // Arrange
        const longDescription = 'A'.repeat(300);
        const positionWithLongDescription = { ...mockPosition, description: longDescription };

        // Act
        render(<PositionCard position={positionWithLongDescription} {...mockCallbacks} />);

        // Assert
        const descriptionElement = screen.getByText(longDescription);
        expect(descriptionElement).toHaveClass('text-truncate');
        expect(descriptionElement).toHaveAttribute('title', longDescription);
    });
});
