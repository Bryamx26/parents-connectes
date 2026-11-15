import Modal from './Modal.jsx';
import Carousel from './Carousel.jsx';

export default function Lightbox({ images, start, title, onClose }) {
  return (
    <Modal onClose={onClose} labelledBy="lightbox-titre">
      <h2 className="pc-visually-hidden" id="lightbox-titre">{title}</h2>
      <div className="pc-lightbox"><Carousel images={images} start={start} label={title} /></div>
    </Modal>
  );
}
