/* eslint-disable react/prop-types */
function PageLoader({ contained = false, message = 'Préparation de votre espace' }) {
  return (
    <div
      className={`page-loader ${contained ? 'page-loader-contained' : 'page-loader-fullscreen'}`}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="page-loader-decoration decoration-one" aria-hidden="true" />
      <div className="page-loader-decoration decoration-two" aria-hidden="true" />

      <div className="page-loader-content">
        <div className="page-loader-emblem" aria-hidden="true">
          <span className="page-loader-orbit orbit-one" />
          <span className="page-loader-orbit orbit-two" />
          <div className="page-loader-logo-wrap">
            <img src="/image/logoSaintPaul.png" alt="" />
          </div>
        </div>

        <div className="page-loader-copy">
          <strong>CCStP</strong>
          <p>{message}</p>
          <div className="page-loader-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PageLoader;
