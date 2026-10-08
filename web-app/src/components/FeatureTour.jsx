import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FeatureTour({ features, onClose }) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef(null);
  const feature = features[step];
  const Icon = feature.icon;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const dialog = dialogRef.current;
    dialog?.focus();
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = dialog.querySelectorAll('button:not(:disabled), a[href]');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus?.();
    };
  }, [onClose]);

  const isLastStep = step === features.length - 1;

  return (
    <div className="feature-tour-backdrop">
      <section
        className="feature-tour-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feature-tour-title"
        aria-describedby="feature-tour-description"
        ref={dialogRef}
        tabIndex="-1"
      >
        <div className="feature-tour-topline">
          <span className="feature-tour-brand"><span>nutrinote</span><i>.</i></span>
          <button className="icon-button feature-tour-close" type="button" onClick={onClose} aria-label="Đóng hướng dẫn">
            <X size={19} />
          </button>
        </div>

        <div className="feature-tour-progress" aria-label={`Bước ${step + 1} trên ${features.length}`}>
          <div><span>BƯỚC {String(step + 1).padStart(2, '0')} / {String(features.length).padStart(2, '0')}</span><span>KHÁM PHÁ TÍNH NĂNG</span></div>
          <div className="feature-tour-track"><i style={{ width: `${((step + 1) / features.length) * 100}%` }} /></div>
        </div>

        <div className="feature-tour-preview" aria-hidden="true">
          <span className="feature-tour-preview-icon"><Icon size={23} /></span>
          <div><small>BẠN ĐANG KHÁM PHÁ</small><b>{feature.label}</b></div>
          <span className="feature-tour-preview-count">{String(step + 1).padStart(2, '0')}</span>
        </div>

        <div className="feature-tour-copy">
          <span className="section-kicker">{feature.kicker}</span>
          <h2 id="feature-tour-title">{feature.title}</h2>
          <p id="feature-tour-description">{feature.description}</p>
        </div>

        <div className="feature-tour-details">
          <span>BẠN CÓ THỂ</span>
          <ul>
            {feature.highlights.map((highlight) => (
              <li key={highlight}><Check size={15} />{highlight}</li>
            ))}
          </ul>
        </div>

        <div className="feature-tour-actions">
          <button className="feature-tour-skip" type="button" onClick={onClose}>Bỏ qua hướng dẫn</button>
          <div className="feature-tour-navigation">
            {step > 0 && (
              <button className="btn btn-secondary feature-tour-back" type="button" onClick={() => setStep((current) => current - 1)}>
                <ArrowLeft size={15} /><span>Trước</span>
              </button>
            )}
            <Link className="btn btn-primary feature-tour-visit" to={feature.to} onClick={onClose}>
              Dùng thử <ArrowRight size={15} />
            </Link>
            <button
              className="btn btn-dark feature-tour-next"
              type="button"
              onClick={() => isLastStep ? onClose() : setStep((current) => current + 1)}
            >
              {isLastStep ? 'Hoàn tất' : 'Tiếp theo'} {!isLastStep && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
