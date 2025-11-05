export const CompletedMilestoneIcon = ({ id = "completed" }: { id?: string }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="64" rx="32" fill={`url(#paint0_linear_${id})`}/>
    <path d="M20.1143 31.535L28.9056 40.2285L43.8857 25.6" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id={`paint0_linear_${id}`} x1="4.247" y1="39.8202" x2="57.312" y2="10.9951" gradientUnits="userSpaceOnUse">
        <stop stopColor="#5755FF"/>
        <stop offset="0.985577" stopColor="#1989FA"/>
      </linearGradient>
    </defs>
  </svg>
);
