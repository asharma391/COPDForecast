import { element } from './dom';

export function selectZone(z: string) {
  const aC = element('.all-actions-container');
  aC.classList.add('visible');
  document.querySelectorAll('.zone').forEach((zz) => {
    zz.classList.add('dimmed');
    zz.classList.remove('selected');
  });
  element(`.zone.${z}`).classList.remove('dimmed');
  element(`.zone.${z}`).classList.add('selected');
  document.querySelectorAll('.action-section').forEach((sec) => {
    sec.classList.remove('active');
    sec
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"]')
      .forEach((cB) => {
        cB.disabled = true;
      });
  });
  const aS = element(`.action-section.${z}`);
  aS.classList.add('active');
  aS.querySelectorAll<HTMLInputElement>('input[type="checkbox"]').forEach(
    (cB) => {
      cB.disabled = false;
    },
  );
}

document.addEventListener('DOMContentLoaded', function () {
  document
    .querySelectorAll<HTMLInputElement>('.action-item input[type="checkbox"]')
    .forEach((cB) => {
      cB.addEventListener('click', (e) => {
        const sec = cB.closest<HTMLElement>('.action-section')!;
        if (!sec.classList.contains('active')) {
          e.preventDefault();
          const color = sec.classList.contains('green')
            ? 'green'
            : sec.classList.contains('yellow')
              ? 'yellow'
              : 'red';
          selectZone(color);
        }
      });
    });
});
