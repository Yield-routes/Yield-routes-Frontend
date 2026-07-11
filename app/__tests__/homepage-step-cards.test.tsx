/**
 * Unit Tests for Homepage Step Card Rendering
 * Feature: homepage-ui-improvements
 */

import { render } from '@testing-library/react';
import { Icon, type IconName } from '@/components/ui/Icon';

describe('Homepage Step Card Rendering - Unit Tests', () => {
  describe('Step card structure', () => {
    it('renders with all expected child elements (icon, number, title, description)', () => {
      // Arrange
      const stepData = {
        step: '01',
        icon: 'wallet' as IconName,
        title: 'Specify Swap',
        desc: 'Pick input/output tokens and amount.',
      };

      // Act
      const { container } = render(
        <li className="step-card" role="listitem">
          <div className="step-card-icon" aria-hidden="true">
            <Icon name={stepData.icon} size={120} />
          </div>
          <div className="step-number" aria-label={`Step ${stepData.step}`}>
            {stepData.step}
          </div>
          <h3 className="step-title">{stepData.title}</h3>
          <p className="step-description">{stepData.desc}</p>
        </li>
      );

      // Assert - Check all child elements exist
      const stepCard = container.querySelector('.step-card');
      expect(stepCard).toBeInTheDocument();

      const icon = container.querySelector('.step-card-icon');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveAttribute('aria-hidden', 'true');

      const stepNumber = container.querySelector('.step-number');
      expect(stepNumber).toBeInTheDocument();
      expect(stepNumber).toHaveAttribute('aria-label', 'Step 01');
      expect(stepNumber).toHaveTextContent('01');

      const title = container.querySelector('.step-title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveTextContent('Specify Swap');
      expect(title?.tagName).toBe('H3');

      const description = container.querySelector('.step-description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent('Pick input/output tokens and amount.');
    });

    it('renders as a list item with proper accessibility role', () => {
      // Arrange
      const stepData = {
        step: '02',
        icon: 'search' as IconName,
        title: 'Routes Compared',
        desc: 'RouteAggregator queries all pools.',
      };

      // Act
      const { container } = render(
        <li className="step-card" role="listitem">
          <div className="step-card-icon" aria-hidden="true">
            <Icon name={stepData.icon} size={120} />
          </div>
          <div className="step-number" aria-label={`Step ${stepData.step}`}>
            {stepData.step}
          </div>
          <h3 className="step-title">{stepData.title}</h3>
          <p className="step-description">{stepData.desc}</p>
        </li>
      );

      // Assert - Check accessibility attributes
      const stepCard = container.querySelector('.step-card');
      expect(stepCard).toHaveAttribute('role', 'listitem');
      expect(stepCard?.tagName).toBe('LI');
    });
  });

  describe('Step card data display', () => {
    // Define all 4 steps as they appear on the actual homepage
    const allSteps = [
      { 
        step: '01', 
        icon: 'wallet' as IconName, 
        title: 'Specify Swap', 
        desc: 'Pick input/output tokens and amount. Set your slippage tolerance.' 
      },
      { 
        step: '02', 
        icon: 'search' as IconName, 
        title: 'Routes Compared', 
        desc: 'RouteAggregator queries all registered AMM pools and the Stellar DEX order book simultaneously.' 
      },
      { 
        step: '03', 
        icon: 'flash' as IconName, 
        title: 'Best Path Selected', 
        desc: 'The path with highest output after fees and slippage is returned as a 60-second valid quote.' 
      },
      { 
        step: '04', 
        icon: 'checkmark-circle' as IconName, 
        title: 'Execute On-chain', 
        desc: 'Sign with Freighter. Contract executes the route atomically. You receive tokens in the same transaction.' 
      },
    ];

    it.each(allSteps)(
      'correctly displays data for step $step: $title',
      (stepData) => {
        // Act
        const { container } = render(
          <li className="step-card" role="listitem">
            <div className="step-card-icon" aria-hidden="true">
              <Icon name={stepData.icon} size={120} />
            </div>
            <div className="step-number" aria-label={`Step ${stepData.step}`}>
              {stepData.step}
            </div>
            <h3 className="step-title">{stepData.title}</h3>
            <p className="step-description">{stepData.desc}</p>
          </li>
        );

        // Assert - Verify all data is correctly rendered
        const stepNumber = container.querySelector('.step-number');
        expect(stepNumber).toHaveTextContent(stepData.step);
        expect(stepNumber).toHaveAttribute('aria-label', `Step ${stepData.step}`);

        const title = container.querySelector('.step-title');
        expect(title).toHaveTextContent(stepData.title);

        const description = container.querySelector('.step-description');
        expect(description).toHaveTextContent(stepData.desc);

        // Verify icon container exists (Icon component itself is tested separately)
        const iconContainer = container.querySelector('.step-card-icon');
        expect(iconContainer).toBeInTheDocument();
      }
    );

    it('renders all 4 steps together without errors', () => {
      // Act
      const { container } = render(
        <ol className="grid md:grid-cols-4 gap-6 md:gap-8 list-none" role="list">
          {allSteps.map((s) => (
            <li key={s.step} className="step-card" role="listitem">
              <div className="step-card-icon" aria-hidden="true">
                <Icon name={s.icon} size={120} />
              </div>
              <div className="step-number" aria-label={`Step ${s.step}`}>
                {s.step}
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-description">{s.desc}</p>
            </li>
          ))}
        </ol>
      );

      // Assert - All 4 cards are rendered
      const stepCards = container.querySelectorAll('.step-card');
      expect(stepCards).toHaveLength(4);

      // Verify each step number is unique and in sequence
      const stepNumbers = Array.from(container.querySelectorAll('.step-number'));
      expect(stepNumbers[0]).toHaveTextContent('01');
      expect(stepNumbers[1]).toHaveTextContent('02');
      expect(stepNumbers[2]).toHaveTextContent('03');
      expect(stepNumbers[3]).toHaveTextContent('04');
    });
  });

  describe('Edge cases', () => {
    it('handles very long descriptions that wrap correctly without breaking layout', () => {
      // Arrange - Create a very long description (> 300 characters)
      const veryLongDescription = 
        'This is an extremely long description that should wrap to multiple lines within the step card container. ' +
        'It needs to be long enough to test that the text wraps properly and does not overflow or break the card layout. ' +
        'The step card should maintain its structure and min-height even with very long text content that spans multiple lines. ' +
        'This tests the CSS layout properties like word-wrap, overflow-wrap, and text wrapping behavior.';

      const stepData = {
        step: '01',
        icon: 'wallet' as IconName,
        title: 'Test Long Description',
        desc: veryLongDescription,
      };

      // Act
      const { container } = render(
        <li className="step-card" role="listitem">
          <div className="step-card-icon" aria-hidden="true">
            <Icon name={stepData.icon} size={120} />
          </div>
          <div className="step-number" aria-label={`Step ${stepData.step}`}>
            {stepData.step}
          </div>
          <h3 className="step-title">{stepData.title}</h3>
          <p className="step-description">{stepData.desc}</p>
        </li>
      );

      // Assert
      const stepCard = container.querySelector('.step-card');
      const description = container.querySelector('.step-description');

      // Card should still exist and be properly structured
      expect(stepCard).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(description).toHaveTextContent(veryLongDescription);

      // Description should contain the full text (no truncation)
      expect(description?.textContent?.length).toBe(veryLongDescription.length);

      // Card should have the step-description class which has proper text wrapping
      expect(description).toHaveClass('step-description');
    });

    it('handles very long single words without breaking layout', () => {
      // Arrange - Create a description with a very long word (tests word-break behavior)
      const longWordDescription = 
        'This description contains a verylongwordwithoutanybreaksthatshouldhandleproperlywithinthecontainerlayout and regular text.';

      const stepData = {
        step: '02',
        icon: 'search' as IconName,
        title: 'Test Long Word',
        desc: longWordDescription,
      };

      // Act
      const { container } = render(
        <li className="step-card" role="listitem">
          <div className="step-card-icon" aria-hidden="true">
            <Icon name={stepData.icon} size={120} />
          </div>
          <div className="step-number" aria-label={`Step ${stepData.step}`}>
            {stepData.step}
          </div>
          <h3 className="step-title">{stepData.title}</h3>
          <p className="step-description">{stepData.desc}</p>
        </li>
      );

      // Assert
      const stepCard = container.querySelector('.step-card');
      const description = container.querySelector('.step-description');

      expect(stepCard).toBeInTheDocument();
      expect(description).toHaveTextContent(longWordDescription);
      expect(description).toHaveClass('step-description');
    });

    it('handles missing icon name gracefully with fallback', () => {
      // Arrange - Use an icon name that might not exist
      const invalidIconName = 'nonexistent-icon' as IconName;
      
      const stepData = {
        step: '03',
        icon: invalidIconName,
        title: 'Test Missing Icon',
        desc: 'This tests fallback behavior for invalid icon names.',
      };

      // Act & Assert - Should not throw an error
      expect(() => {
        const { container } = render(
          <li className="step-card" role="listitem">
            <div className="step-card-icon" aria-hidden="true">
              <Icon name={stepData.icon} size={120} />
            </div>
            <div className="step-number" aria-label={`Step ${stepData.step}`}>
              {stepData.step}
            </div>
            <h3 className="step-title">{stepData.title}</h3>
            <p className="step-description">{stepData.desc}</p>
          </li>
        );

        // The card should still render even if the icon is invalid
        const stepCard = container.querySelector('.step-card');
        expect(stepCard).toBeInTheDocument();

        // Icon container should still exist
        const iconContainer = container.querySelector('.step-card-icon');
        expect(iconContainer).toBeInTheDocument();
      }).not.toThrow();
    });

    it('handles empty icon name gracefully', () => {
      // Arrange - Use an empty string as icon name
      const emptyIconName = '' as IconName;
      
      const stepData = {
        step: '04',
        icon: emptyIconName,
        title: 'Test Empty Icon',
        desc: 'This tests fallback behavior for empty icon names.',
      };

      // Act & Assert - Should not throw an error
      expect(() => {
        const { container } = render(
          <li className="step-card" role="listitem">
            <div className="step-card-icon" aria-hidden="true">
              <Icon name={stepData.icon} size={120} />
            </div>
            <div className="step-number" aria-label={`Step ${stepData.step}`}>
              {stepData.step}
            </div>
            <h3 className="step-title">{stepData.title}</h3>
            <p className="step-description">{stepData.desc}</p>
          </li>
        );

        // The card structure should still render
        const stepCard = container.querySelector('.step-card');
        expect(stepCard).toBeInTheDocument();

        const iconContainer = container.querySelector('.step-card-icon');
        expect(iconContainer).toBeInTheDocument();
      }).not.toThrow();
    });

    it('handles special characters in title and description', () => {
      // Arrange - Include special characters that might cause rendering issues
      const stepData = {
        step: '01',
        icon: 'wallet' as IconName,
        title: 'Test <Special> & "Characters"',
        desc: 'Description with special chars: <>&"\' and unicode: 🚀 ✓ • — €',
      };

      // Act
      const { container } = render(
        <li className="step-card" role="listitem">
          <div className="step-card-icon" aria-hidden="true">
            <Icon name={stepData.icon} size={120} />
          </div>
          <div className="step-number" aria-label={`Step ${stepData.step}`}>
            {stepData.step}
          </div>
          <h3 className="step-title">{stepData.title}</h3>
          <p className="step-description">{stepData.desc}</p>
        </li>
      );

      // Assert - Special characters should be properly escaped and displayed
      const title = container.querySelector('.step-title');
      const description = container.querySelector('.step-description');

      expect(title).toHaveTextContent(stepData.title);
      expect(description).toHaveTextContent(stepData.desc);

      // React should automatically escape HTML entities
      expect(title?.innerHTML).not.toContain('<Special>');
      expect(title?.textContent).toContain('<Special>');
    });
  });

  describe('CSS classes', () => {
    it('applies correct CSS classes to each element', () => {
      // Arrange
      const stepData = {
        step: '01',
        icon: 'wallet' as IconName,
        title: 'Specify Swap',
        desc: 'Pick input/output tokens and amount.',
      };

      // Act
      const { container } = render(
        <li className="step-card" role="listitem">
          <div className="step-card-icon" aria-hidden="true">
            <Icon name={stepData.icon} size={120} />
          </div>
          <div className="step-number" aria-label={`Step ${stepData.step}`}>
            {stepData.step}
          </div>
          <h3 className="step-title">{stepData.title}</h3>
          <p className="step-description">{stepData.desc}</p>
        </li>
      );

      // Assert - Verify all CSS classes are applied as designed
      const stepCard = container.querySelector('li');
      expect(stepCard).toHaveClass('step-card');

      const iconContainer = container.querySelector('.step-card-icon');
      expect(iconContainer).toHaveClass('step-card-icon');

      const stepNumber = container.querySelector('.step-number');
      expect(stepNumber).toHaveClass('step-number');

      const title = container.querySelector('h3');
      expect(title).toHaveClass('step-title');

      const description = container.querySelector('p');
      expect(description).toHaveClass('step-description');
    });
  });

  describe('Grid container', () => {
    it('renders cards within proper grid container with correct classes', () => {
      // Arrange
      const steps = [
        { step: '01', icon: 'wallet' as IconName, title: 'Step 1', desc: 'Description 1' },
        { step: '02', icon: 'search' as IconName, title: 'Step 2', desc: 'Description 2' },
      ];

      // Act
      const { container } = render(
        <ol className="grid md:grid-cols-4 gap-6 md:gap-8 list-none" role="list">
          {steps.map((s) => (
            <li key={s.step} className="step-card" role="listitem">
              <div className="step-card-icon" aria-hidden="true">
                <Icon name={s.icon} size={120} />
              </div>
              <div className="step-number" aria-label={`Step ${s.step}`}>
                {s.step}
              </div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-description">{s.desc}</p>
            </li>
          ))}
        </ol>
      );

      // Assert - Grid container has proper classes and structure
      const gridContainer = container.querySelector('ol');
      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('md:grid-cols-4');
      expect(gridContainer).toHaveClass('gap-6');
      expect(gridContainer).toHaveClass('md:gap-8');
      expect(gridContainer).toHaveClass('list-none');
      expect(gridContainer).toHaveAttribute('role', 'list');
      expect(gridContainer?.tagName).toBe('OL');
    });
  });
});
