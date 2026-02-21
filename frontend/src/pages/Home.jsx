import { useEffect, useState } from 'react';
import api from '../api/api';

function Home() {
  const [examples, setExamples] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/examples')
      .then((data) => setExamples(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Comma</h1>
      {loading ? (
        <p>불러오는 중...</p>
      ) : (
        <ul>
          {examples.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;
