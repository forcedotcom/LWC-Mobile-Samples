import { createElement } from 'lwc';
import ImagePainter from 'c/imagePainter';

describe('c-image-painter', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('displays the four colors', () => {
        // Arrange
        const imagePainter = createElement('c-image-painter', {
            is: ImagePainter
        });

        // Act
        document.body.appendChild(imagePainter);

        // Assert
        const red = imagePainter.shadowRoot.querySelector('.dot_button .red');
        expect(red).not.toBeNull();
        const green = imagePainter.shadowRoot.querySelector('.dot_button .green');
        expect(green).not.toBeNull();
        const white = imagePainter.shadowRoot.querySelector('.dot_button .white');
        expect(white).not.toBeNull();
        const black = imagePainter.shadowRoot.querySelector('.dot_button .black');
        expect(black).not.toBeNull();
    });
});