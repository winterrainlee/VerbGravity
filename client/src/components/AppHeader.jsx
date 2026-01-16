import { LogIn } from 'lucide-react';
import './AppHeader.css';

const AppHeader = ({ onLoginClick, onLogoClick }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo" onClick={onLogoClick}>
          <span role="img" aria-label="sprout">🌱</span>
          <span className="logo-text">VerbGravity</span>
        </div>

        <button
          className="btn btn-text teacher-login-btn"
          onClick={onLoginClick}
        >
          <span className="btn-label">교사 로그인</span>
          <LogIn size={18} />
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
