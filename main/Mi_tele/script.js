const API_URL = '/api/content';

const contentList = document.getElementById('content-list');
const addBtn = document.getElementById('addBtn');

async function getContent() {

  const response = await fetch(API_URL);

  const data = await response.json();

  contentList.innerHTML = '';

  data.forEach(item => {

    const div = document.createElement('div');

    div.classList.add('card');

    div.innerHTML = `
      <h2>${item.title}</h2>
      <p>Tipo: ${item.type}</p>
      <p>Nota: ${item.rating ?? '-'}</p>
    `;

    contentList.appendChild(div);

  });

}

async function addContent() {

  const title = document.getElementById('title').value;
  const type = document.getElementById('type').value;
  const rating = document.getElementById('rating').value;

  if (!title) return;

  await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      type,
      rating
    })
  });

  document.getElementById('title').value = '';
  document.getElementById('rating').value = '';

  getContent();

}

addBtn.addEventListener('click', addContent);

getContent();