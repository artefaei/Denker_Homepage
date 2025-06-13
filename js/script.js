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
        menu?.classList.toggle("active");
      });

      // Scroll-Hide-Navbar-Logik nach dem Laden der Navbar
      const navbar = document.querySelector('.navbar');
      const logo = document.getElementById('global-logo');
      let lastScroll = window.scrollY;

      window.addEventListener('scroll', function() {
        const curr = window.scrollY;
        if (curr > lastScroll && curr > 40) {
          if (navbar) {
            navbar.classList.add('hide-navbar');
            navbar.classList.remove('show-navbar');
          }
          if (logo) {
            logo.classList.add('hide-navbar');
            logo.classList.remove('show-navbar');
          }
        } else {
          if (navbar) {
            navbar.classList.remove('hide-navbar');
            navbar.classList.add('show-navbar');
          }
          if (logo) {
            logo.classList.remove('hide-navbar');
            logo.classList.add('show-navbar');
          }
        }
        lastScroll = curr;
      });

      if (navbar) navbar.classList.add('show-navbar');
      if (logo) logo.classList.add('show-navbar');
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
      const oldFooter = document.querySelector('footer');
      if (oldFooter) oldFooter.remove();
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

// Endlos horizontale Slideshow für die Bilderleiste (leistungentest.html)
(function() {
    const track = document.querySelector('.bilderleiste-track');
    if (!track) return;
    const images = Array.from(track.querySelectorAll('img'));
    // Klone alle Bilder für Endlosschleife
    images.forEach(img => track.appendChild(img.cloneNode(true)));
    const total = images.length;
    let pxPerFrame = 1.2;
    let pos = 0;
    let imgWidth = images[0].offsetWidth || 220;

    function updateWidth() {
        imgWidth = images[0].offsetWidth || 220;
    }
    window.addEventListener('resize', updateWidth);

    function animate() {
        pos += pxPerFrame;
        if (pos >= imgWidth * total) pos = 0;
        track.style.transform = `translateX(-${pos}px)`;
        requestAnimationFrame(animate);
    }
    updateWidth();
    animate();
})();

// Animierte Wortrotation für die Leistungen-Box auf der Startseite
(function() {
  const worte = [
    "Baugrunduntersuchung",
    "Altlasten",
    "Bauüberwachung",
    "Bodenmanagement",
    "Schadstoffgutachten",
    "Versickerung",
    "Baugrunderkundung",
    "Umweltberatung"
    // ...füge hier alle gewünschten Wörter von der Leistungen-Seite ein...
  ];
  const ziel = document.querySelector('.leistungen-wechselwort');
  let idx = 0;
  function wechsel() {
    if (!ziel) return;
    ziel.textContent = worte[idx];
    ziel.style.animation = 'none';
    // Trigger reflow for animation restart
    void ziel.offsetWidth;
    ziel.style.animation = '';
    idx = (idx + 1) % worte.length;
    setTimeout(wechsel, 1800);
  }
  if (ziel) wechsel();
})();

// Optional: Hero-Text Typing-Effekt
document.addEventListener('DOMContentLoaded', function() {
  const wechsel = [
    "Schadstoff-Rückbau",
    "Altlastenmanagement",
    "Bauüberwachung",
    "Umweltberatung",
    "Projektbegleitung"
  ];
  let i = 0;
  const span = document.querySelector('.leistungen-wechselwort');
  function nextWord() {
    if (!span) return;
    span.textContent = wechsel[i];
    i = (i + 1) % wechsel.length;
    setTimeout(nextWord, 1800);
  }
  if (span) nextWord();
});

var lastScrollTop = 0;
$(window).scroll(function(event){
  var st = $(this).scrollTop();
  if (st > lastScrollTop){
    if (!$('body').hasClass('down')) {
      $('body').addClass('down');
    }
   } else {
     $('body').removeClass('down');
   }

   lastScrollTop = st;

   if ($(this).scrollTop() <= 0) {
     $('body').removeClass('down');
   };
});

// Globale Navigation und Footer dynamisch laden (wenn gewünscht)
document.addEventListener('DOMContentLoaded', function() {
  // Beispiel: Navigation und Footer per AJAX laden
  const navContainer = document.getElementById('navbar-container');
  if (navContainer) {
    fetch('navbar.html')
      .then(res => res.text())
      .then(html => { navContainer.innerHTML = html; });
  }
  const footerContainer = document.getElementById('footer-container');
  if (footerContainer) {
    fetch('footer.html')
      .then(res => res.text())
      .then(html => { footerContainer.innerHTML = html; });
  }

  // Navbar-Links: Scroll zu Kachel mit Offset
  document.querySelectorAll('.altlasten-nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href').replace('#', '');
      const target = document.getElementById(targetId);
      if (target) {
        e.preventDefault();
        const nav = document.querySelector('.altlasten-nav');
        const navHeight = nav ? nav.offsetHeight + 16 : 0;
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
        setTimeout(() => {
          window.scrollBy({top: -navHeight - 20, left: 0, behavior: 'smooth'});
        }, 200);
        document.querySelectorAll('.altlasten-nav a').forEach(l => l.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Scrollspy für Navbar
  window.addEventListener('scroll', function() {
    const navLinks = document.querySelectorAll('.altlasten-nav a');
    const nav = document.querySelector('.altlasten-nav');
    const navHeight = nav ? nav.offsetHeight + 30 : 0;
    let found = false;
    ['erkundung','rueckbaukonzept','entsorgung','baubegleitung','freimessung','beratung'].forEach(id => {
      const box = document.getElementById(id);
      if (box && (box.offsetTop - navHeight <= window.scrollY)) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector('.altlasten-nav a[href="#' + id + '"]');
        if (active) active.classList.add('active');
        found = true;
      }
    });
    if (!found) navLinks.forEach(link => link.classList.remove('active'));
  }, {passive:true});
});

// Leistungen-Grid: Beschreibung aufklappen über Untertitel-Link
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.leistung-card').forEach(card => {
    const descP = card.querySelector('p');
    const sublinks = card.querySelectorAll('.leistung-link');
    sublinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // Wenn derselbe Link aktiv ist: wieder einklappen
        if (this.classList.contains('active')) {
          this.classList.remove('active');
          descP.classList.remove('open');
          descP.textContent = '';
          return;
        }
        // Entferne "active" von allen Links in dieser Card
        sublinks.forEach(l => l.classList.remove('active'));
        // Setze "active" auf den geklickten Link
        this.classList.add('active');
        // Setze Beschreibung
        descP.textContent = this.getAttribute('data-desc') || '';
        // Zeige Beschreibung an
        descP.classList.add('open');
      });
    });
    // Optional: Beschreibung ausblenden, wenn außerhalb geklickt wird
    document.addEventListener('click', function(ev) {
      if (!card.contains(ev.target)) {
        descP.classList.remove('open');
        sublinks.forEach(l => l.classList.remove('active'));
        descP.textContent = '';
      }
    });
  });
});