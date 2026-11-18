const cases = [...document.querySelectorAll('.case')];
const pages = [...document.querySelectorAll('.page')];
const navigation = [...document.querySelectorAll('nav a')];
const query = document.querySelector('#q');
const category = document.querySelector('#cat');
const grade = document.querySelector('#grade');
const more = document.querySelector('#more');
let limit = 20;

function filterCases() {
  const term = query.value.trim().toLocaleLowerCase();
  const matches = cases.filter(item =>
    (!category.value || category.value === item.dataset.c) &&
    (!grade.value || grade.value === item.dataset.g) &&
    item.textContent.toLocaleLowerCase().includes(term)
  );
  const visible = new Set(matches.slice(0, limit));
  cases.forEach(item => { item.hidden = !visible.has(item); });
  document.querySelector('#total').textContent = matches.length + '개 사례';
  document.querySelector('#empty').hidden = matches.length > 0;
  more.hidden = visible.size >= matches.length;
  more.textContent = '사례 더 보기 (' + visible.size + ' / ' + matches.length + ') ↓';
}
function resetFilters() {
  query.value = category.value = grade.value = '';
  limit = 20;
  filterCases();
}
function showPage(scroll) {
  const hash = location.hash.slice(1);
  const selected = cases.find(item => item.id === hash);
  const id = pages.some(page => page.id === hash) ? hash : 'cases';
  pages.forEach(page => { page.hidden = page.id !== id; });
  navigation.forEach(link => {
    if (link.hash === '#' + id) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (selected) {
    resetFilters();
    limit = Math.ceil((cases.indexOf(selected) + 1) / 20) * 20;
    filterCases();
    selected.open = true;
  }
  if (scroll) (selected || document.querySelector('nav')).scrollIntoView({block:'start'});
}
query.addEventListener('input', () => { limit = 20; filterCases(); });
[category, grade].forEach(control => control.addEventListener('change', () => { limit = 20; filterCases(); }));
more.addEventListener('click', () => {
  const previous = cases.filter(item => !item.hidden).length;
  limit += 20;
  filterCases();
  cases.filter(item => !item.hidden)[previous]?.querySelector('summary').focus({preventScroll:true});
});
document.querySelector('#reset').addEventListener('click', () => { resetFilters(); query.focus(); });
window.addEventListener('hashchange', () => showPage(true));
filterCases();
showPage(Boolean(location.hash));
