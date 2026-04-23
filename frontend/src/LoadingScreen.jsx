import './LoadingScreen.css'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <p className="loading-text">Загрузка...</p>
      </div>
    </div>
  )
}

export default LoadingScreen