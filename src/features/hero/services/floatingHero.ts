// FloatingHero Drag & Drop Handler
// Korrigiert das CSS Transform Scale Problem

interface DragPosition {
  x: number;
  y: number;
}

interface DragStart {
  x: number;
  y: number;
}

export class FloatingHeroDragHandler {
  private element: HTMLElement;
  private scale: number;
  private isDragging: boolean;
  private dragStart: DragStart;
  private position: DragPosition;

  constructor(element: HTMLElement, scale: number = 0.5) {
    this.element = element;
    this.scale = scale;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.position = { x: 0, y: 0 };
    
    // Bind methods
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    
    this.init();
  }
  
  private init(): void {
    this.element.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }
  
  private handleMouseDown(e: MouseEvent): void {
    e.preventDefault();
    
    const rect = this.element.getBoundingClientRect();
    
    // Calculate scaled bounds
    const scaledWidth = rect.width * this.scale;
    const scaledHeight = rect.height * this.scale;
    
    // Check if click is within the scaled area
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;
    
    if (relativeX < 0 || relativeX > scaledWidth || relativeY < 0 || relativeY > scaledHeight) {
      return; // Click outside scaled area, don't start drag
    }
    
    this.isDragging = true;
    this.dragStart = {
      x: e.clientX - this.position.x,
      y: e.clientY - this.position.y
    };
    
    this.element.style.cursor = 'grabbing';
  }
  
  private handleMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    
    e.preventDefault();
    
    const newX = e.clientX - this.dragStart.x;
    const newY = e.clientY - this.dragStart.y;
    
    const constrained = this.constrainPosition(newX, newY);
    this.position = constrained;
    
    this.updatePosition();
  }
  
  private handleMouseUp(): void {
    this.isDragging = false;
    this.element.style.cursor = 'grab';
  }
  
  private constrainPosition(x: number, y: number): DragPosition {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const header = document.querySelector('.header') as HTMLElement;
    const footer = document.querySelector('.footer') as HTMLElement;
    
    const headerHeight = header ? header.getBoundingClientRect().height : 100;
    const footerHeight = footer ? footer.getBoundingClientRect().height : 80;
    
    const rect = this.element.getBoundingClientRect();
    const elementWidth = rect.width * this.scale;
    const elementHeight = rect.height * this.scale;
    
    const minX = 0;
    const maxX = viewportWidth - elementWidth;
    const minY = headerHeight;
    const maxY = viewportHeight - elementHeight - footerHeight;
    
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }
  
  private updatePosition(): void {
    // Update React state instead of direct DOM manipulation
    const event = new CustomEvent('floatingHeroPositionUpdate', {
      detail: { x: this.position.x, y: this.position.y }
    });
    document.dispatchEvent(event);
  }
  
  public destroy(): void {
    this.element.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }
}

// Export für Verwendung
export default FloatingHeroDragHandler;

