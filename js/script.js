document.addEventListener("DOMContentLoaded", () => {
  // Dynamically load the navbar
  fetch("navbar.html")
    .then(response => response.text())
    .then(data => {
      document.getElementById("navbar-container").innerHTML = data;

      // Initialize toggle functionality after navbar is loaded
      const toggleButton = document.querySelector(".navbar-toggle");
      const menu = document.querySelector(".navbar-menu");

      toggleButton?.addEventListener("click", () => {
        menu?.classList.toggle("active"); // Toggle the 'active' class
      });
    })
    .catch(error => console.error("Error loading navbar:", error));

  // Dynamically load the global logo
  fetch('components/logo.html')
    .then(response => response.text())
    .then(html => {
      const logoContainer = document.createElement('div');
      logoContainer.id = 'global-logo';
      logoContainer.innerHTML = html;
      document.body.insertBefore(logoContainer, document.body.firstChild);
    })
    .catch(error => console.error('Error loading global logo:', error));

  // Dynamically load the global footer
  fetch('components/footer.html')
    .then(response => response.text())
    .then(html => {
      // Remove any existing footer
      const oldFooter = document.querySelector('footer');
      if (oldFooter) oldFooter.remove();
      // Add new footer at the end of body
      document.body.insertAdjacentHTML('beforeend', html);
    })
    .catch(error => console.error('Error loading global footer:', error));
});

document.addEventListener('DOMContentLoaded', function() {
    // Workspace Boxen-Logik
    const boxes = document.querySelectorAll('.workspace-box');
    const detail = document.getElementById('workspace-detail');
    const detailTitle = document.getElementById('detail-title');
    const detailDesc = document.getElementById('detail-desc');
    const grid = document.getElementById('workspace-grid');
    let openIdx = null;

    function getColCount() {
        // Responsive: Ermittle aktuelle Spaltenzahl
        if (!grid) return 3;
        const style = window.getComputedStyle(grid);
        const cols = style.gridTemplateColumns.split(' ').length;
        return cols;
    }

    if (boxes.length && detail && detailTitle && detailDesc && grid) {
        boxes.forEach((box, idx) => {
            box.addEventListener('click', function() {
                // Toggle: Wenn dieselbe Box erneut geklickt wird, schließe die Detailbox
                if (openIdx === idx && detail.classList.contains('active')) {
                    detail.classList.remove('active');
                    boxes.forEach(b => {
                        b.classList.remove('selected', 'push-down');
                        b.style.removeProperty('--detail-height');
                    });
                    openIdx = null;
                    return;
                }

                // Remove selection and push-down from all boxes
                boxes.forEach(b => {
                    b.classList.remove('selected', 'push-down');
                    b.style.removeProperty('--detail-height');
                });
                box.classList.add('selected');

                // Set detail content
                detailTitle.textContent = box.getAttribute('data-title');
                detailDesc.textContent = box.getAttribute('data-desc');
                detail.classList.add('active');

                // Set detail box size to match the clicked box
                detail.style.width = box.offsetWidth + "px";
                detail.style.height = box.offsetHeight + "px";

                // Responsive: Ermittle aktuelle Spaltenzahl
                const colCount = getColCount();
                const row = Math.floor(idx / colCount);
                const col = idx % colCount;

                // Position detail box direkt unter der geklickten Box
                let left = box.offsetLeft;
                let top = box.offsetTop + box.offsetHeight;

                detail.style.left = left + "px";
                detail.style.top = top + "px";

                // Push down alle Boxen in der gleichen Spalte, die unterhalb liegen
                boxes.forEach((b, i) => {
                    const bRow = Math.floor(i / colCount);
                    const bCol = i % colCount;
                    if (bCol === col && bRow > row) {
                        b.classList.add('push-down');
                        b.style.setProperty('--detail-height', detail.offsetHeight + 'px');
                    }
                });

                openIdx = idx;
            });
        });

        // Optional: Hide detail when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.classList.contains('workspace-box') && !detail.contains(e.target)) {
                detail.classList.remove('active');
                boxes.forEach(b => {
                    b.classList.remove('selected', 'push-down');
                    b.style.removeProperty('--detail-height');
                });
                openIdx = null;
            }
        });
    }

    // Workspace Miniboxen-Logik (nur innerhalb workspace-box)
    document.querySelectorAll('.workspace-box').forEach(function(box) {
        const miniboxes = box.querySelectorAll('.minibox');
        if (miniboxes.length && detail && detailTitle && detailDesc) {
            miniboxes.forEach((minibox, idx) => {
                minibox.addEventListener('click', function(e) {
                    e.stopPropagation();

                    // Toggle: Wenn dieselbe Minibox erneut geklickt wird, schließe die Detailbox
                    if (minibox.classList.contains('selected') && detail.classList.contains('active')) {
                        detail.classList.remove('active');
                        miniboxes.forEach(mb => mb.classList.remove('selected'));
                        const grid = document.getElementById('workspace-grid');
                        const boxes = grid ? grid.querySelectorAll('.workspace-box') : [];
                        boxes.forEach(b => {
                            b.classList.remove('push-down');
                            b.style.removeProperty('--detail-height');
                        });
                        openIdx = null;
                        return;
                    }

                    // Remove selection from all miniboxes in this box
                    miniboxes.forEach(mb => mb.classList.remove('selected'));
                    minibox.classList.add('selected');

                    // Set detail content based on parent box
                    detailTitle.textContent = box.getAttribute('data-title') + ' - ' + minibox.textContent;
                    detailDesc.textContent = box.getAttribute('data-desc');
                    detail.classList.add('active');

                    // Set detail box size to match the parent box
                    detail.style.width = box.offsetWidth + "px";
                    detail.style.height = box.offsetHeight + "px";

                    // Position detail box directly below the parent box
                    let left = box.offsetLeft;
                    let top = box.offsetTop + box.offsetHeight;

                    detail.style.left = left + "px";
                    detail.style.top = top + "px";

                    // Push down the box below (falls vorhanden)
                    const grid = document.getElementById('workspace-grid');
                    const boxes = grid ? grid.querySelectorAll('.workspace-box') : [];
                    const idxBox = Array.from(boxes).indexOf(box);
                    const colCount = 3;
                    boxes.forEach(b => b.classList.remove('push-down'));
                    if (boxes[idxBox + colCount]) {
                        boxes[idxBox + colCount].classList.add('push-down');
                        boxes[idxBox + colCount].style.setProperty('--detail-height', detail.offsetHeight + 'px');
                    }
                    openIdx = idxBox;
                });
            });
        }
    });

    // Team-Miniboxen-Logik (nur innerhalb team-member)
    document.querySelectorAll('.team-member').forEach(function(member) {
        const buttons = member.querySelectorAll('.minibox');
        const boxes = member.querySelectorAll('.team-info-box');
        buttons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                // Buttons
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Boxen
                boxes.forEach(box => box.classList.remove('active'));
                const target = member.querySelector('#' + btn.dataset.info);
                if (target) target.classList.add('active');
            });
        });
    });

    // Team-Seite
    const teamMembers = document.querySelectorAll('.team-member');

    teamMembers.forEach(member => {
        const frame = member.querySelector('.portrait-frame');
        const desc = member.getAttribute('data-desc');
        const descBox = member.querySelector('.team-description');
        descBox.textContent = desc;

        frame.addEventListener('click', function(e) {
            // Flip-Animation und Beschreibung anzeigen
            teamMembers.forEach(m => {
                if (m !== member) {
                    m.classList.remove('active');
                    m.querySelector('.portrait-frame').classList.remove('flipped');
                }
            });
            member.classList.toggle('active');
            frame.classList.toggle('flipped');
        });
    });

    // Klick außerhalb schließt Beschreibung/Flip
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.team-member')) {
            teamMembers.forEach(m => {
                m.classList.remove('active');
                m.querySelector('.portrait-frame').classList.remove('flipped');
            });
        }
    });

    // Teamseite Animationen
    const items = document.querySelectorAll('.image-item');
    let animationFrameId;

    items.forEach(item => {
        let isHovered = false;

        item.addEventListener('mouseenter', () => {
            isHovered = true;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }

            animationFrameId = requestAnimationFrame(() => {
                if (isHovered) {
                    const itemRect = item.getBoundingClientRect();
                    const itemCenterX = itemRect.left + itemRect.width / 1.6;

                    items.forEach(otherItem => {
                        if (otherItem !== item) {
                            const otherItemRect = otherItem.getBoundingClientRect();
                            const otherItemCenterX = otherItemRect.left + otherItemRect.width / 1.6;
                            const distance = otherItemCenterX - itemCenterX;
                            const translation = distance * 0.24;
                            otherItem.style.transform = `translateX(${translation}px) scale(0.9)`;
                        } else {
                            otherItem.style.transform = `scale(2.2)`;
                        }
                    });
                }
            });
        });

        item.addEventListener('mouseleave', () => {
            isHovered = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            animationFrameId = requestAnimationFrame(() => {
                items.forEach(otherItem => {
                    otherItem.style.transform = 'translateX(0) scale(1)';
                });
            });
        });
    });

    // Nur eine Toggle-Logik für gebiete2/workspaces Info-Boxen (Links/Buttons klappen Beschreibung auf)
    document.querySelectorAll('.gebiete2-box').forEach(function(box) {
        const toggles = Array.from(box.querySelectorAll('.gebiete2-info-toggle'));
        const infos = Array.from(box.querySelectorAll('.gebiete2-info-content'));
        toggles.forEach(function(btn, idx) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                // Toggle-Logik: Wenn bereits aktiv, alles schließen
                if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    if (infos[idx]) infos[idx].classList.remove('active');
                } else {
                    // Erst alle schließen
                    toggles.forEach(b => b.classList.remove('active'));
                    infos.forEach(i => i.classList.remove('active'));
                    // Dann aktuellen öffnen
                    btn.classList.add('active');
                    if (infos[idx]) infos[idx].classList.add('active');
                }
            });
        });
    });

    // Team-Interaktionen (Miniboxen und Info-Boxen) – NUR für die Teamseite!
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.team-member').forEach(function(member) {
            const buttons = member.querySelectorAll('.minibox');
            const boxes = member.querySelectorAll('.team-info-box');
            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    // Verhindere, dass andere globale Klick-Handler ausgelöst werden
                    e.stopPropagation();
                    // Buttons
                    buttons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    // Boxen
                    boxes.forEach(box => box.classList.remove('active'));
                    const target = member.querySelector('#' + btn.dataset.info);
                    if (target) target.classList.add('active');
                });
            });
        });
    });

});

// Portrait-Modal Funktionen global verfügbar machen
window.showPortraitModal = function(src) {
    var modal = document.getElementById('portrait-modal');
    var img = document.getElementById('portrait-modal-img');
    img.src = src;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

window.hidePortraitModal = function() {
    var modal = document.getElementById('portrait-modal');
    modal.style.display = 'none';
    document.body.style.overflow = '';
};