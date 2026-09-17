import './Footer.css';

export function Footer() {
  return (
    <footer className="site-footer">
      <p>Built as a serverless AWS project.</p>
      <p className="site-footer-stack">AWS Lambda · API Gateway · DynamoDB</p>
    </footer>
  );
}
