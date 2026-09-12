import { byId } from './dom';

export function showPage(pid: string) {
  document.querySelectorAll('.page').forEach((pg) => {
    pg.classList.remove('active');
  });
  byId(pid).classList.add('active');
  document.querySelectorAll('nav a').forEach((lnk) => {
    lnk.classList.remove('active');
    if (lnk.getAttribute('href') === '#' + pid) {
      lnk.classList.add('active');
    }
  });
}
