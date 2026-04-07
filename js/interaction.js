// ===== 鼠标轨迹：底层圆形轨迹 =====
/*
(function () {
  const trail = document.getElementById('mouseTrail');
  if (!trail) return;

  const MAX_DOTS = 40;
  const MIN_DISTANCE = 18;
  const SIZE = 18;

  let lastX = -1;
  let lastY = -1;

  function addDot(x, y) {
    const dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = x + 'px';
    dot.style.top = y + 'px';

    // Generate a random dark gray (e.g. RGB values between 20 and 80)
    const grayValue = Math.floor(Math.random() * 60) + 20;
    dot.style.background = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;

    trail.appendChild(dot);
    if (trail.children.length > MAX_DOTS) {
      trail.removeChild(trail.firstElementChild);
    }
  }

  window.addEventListener('mousemove', function (e) {
    const x = e.clientX;
    const y = e.clientY;
    if (lastX < 0) {
      addDot(x, y);
      lastX = x;
      lastY = y;
      return;
    }
    const dx = x - lastX;
    const dy = y - lastY;
    if (dx * dx + dy * dy >= MIN_DISTANCE * MIN_DISTANCE) {
      addDot(x, y);
      lastX = x;
      lastY = y;
    }
  });
})();
*/

// ===== Header menu toggle & name hover background =====
const headerToggle = document.querySelector('.menu-toggle');
const panel = document.getElementById('menuPanel');
const nameLink = document.querySelector('.name');

// Get the dynamic max height for the footer
function getFooterMaxHeight() {
  if (panel && getComputedStyle(panel).display !== 'none') {
    // Stop below the menu panel with a small ~20px gap
    return window.innerHeight - panel.getBoundingClientRect().bottom - 20;
  }
  // Otherwise stop below the header
  const header = document.querySelector('.site-header');
  const headerBottom = header ? header.getBoundingClientRect().bottom : 60;
  return window.innerHeight - headerBottom;
}

// Allow external triggers to force footer height re-evaluation
window.enforceFooterMaxHeight = function () {
  const footer = document.getElementById('projectsFooter');
  if (footer) {
    const currentHeight = footer.offsetHeight;
    const MAX_HEIGHT = getFooterMaxHeight();
    if (currentHeight > MAX_HEIGHT) {
      footer.style.transition = 'height 0.3s ease';
      footer.style.height = MAX_HEIGHT + 'px';
    }
  }
};

function togglePanelDisplay() {
  const isCurrentlyHidden = getComputedStyle(panel).display === 'none';
  if (isCurrentlyHidden) {
    panel.style.display = 'block';
    if (headerToggle) {
      headerToggle.textContent = '×';
      headerToggle.title = 'close';
    }

    if (typeof window.enforceFooterMaxHeight === 'function') {
      window.enforceFooterMaxHeight();
    }
  } else {
    panel.style.display = 'none';
    if (headerToggle) {
      headerToggle.textContent = '+';
      headerToggle.title = 'about';
    }

    // Automatically move the footer up beneath "Zhenzhen Guo"
    const footer = document.getElementById('projectsFooter');
    if (footer) {
      const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);
      footer.style.transition = 'height 0.3s ease';
      footer.style.height = MAX_HEIGHT + 'px';

      const indexDropdown = document.getElementById('indexDropdown');
      const indexToggleBtn = document.getElementById('indexToggleBtn');
      if (indexDropdown) indexDropdown.classList.remove('show');
      if (indexToggleBtn) indexToggleBtn.classList.remove('open');
    }
  }
}

if (headerToggle && panel) {
  headerToggle.addEventListener('click', togglePanelDisplay);
}

// Custom logic for new Index Dropdown
const indexToggleBtn = document.getElementById('indexToggleBtn');
const indexDropdown = document.getElementById('indexDropdown');

if (indexToggleBtn && indexDropdown) {
  indexToggleBtn.addEventListener('click', (event) => {
    // Determine if the footer is pulled up to decide the dropdown direction.
    // If it's near the top (e.g. height > 200), we drop down, otherwise drop up.
    if (!indexDropdown.classList.contains('show')) {
      const footer = document.getElementById('projectsFooter');
      if (footer) {
        if (footer.offsetHeight > window.innerHeight / 2) {
          indexDropdown.classList.add('drop-down');
        } else {
          indexDropdown.classList.remove('drop-down');
        }
      }
    }

    indexDropdown.classList.toggle('show');
    indexToggleBtn.classList.toggle('open');
    event.stopPropagation();
  });

  document.addEventListener('click', (event) => {
    if (!indexToggleBtn.contains(event.target)) {
      indexDropdown.classList.remove('show');
      indexToggleBtn.classList.remove('open');
    }
  });

  // Make sure clicking links doesn't accidentally trigger parent logic with side effects
  const indexItems = document.querySelectorAll('.index-item');
  indexItems.forEach(item => {
    item.addEventListener('click', (event) => {
      event.stopPropagation();
      const link = item.getAttribute('data-target-link');
      if (link && link !== '#') {
        scrollToProject(link);
      }
    });
  });
}

// 点击作品名跳转到作品
function scrollToProject(link) {
  const projectId = 'project-' + link.replace('.html', '');
  const projectEl = document.getElementById(projectId);

  if (projectEl) {
    const footer = document.getElementById('projectsFooter');
    if (footer) {
      // 1. 展开footer
      const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);

      footer.style.transition = 'height 0.3s ease';
      footer.style.height = MAX_HEIGHT + 'px';

      // 收起list
      const indexDropdown = document.getElementById('indexDropdown');
      const indexToggleBtn = document.getElementById('indexToggleBtn');
      if (indexDropdown) indexDropdown.classList.remove('show');
      if (indexToggleBtn) indexToggleBtn.classList.remove('open');

      // 2. 滚动到作品
      const scrollArea = document.querySelector('.footer-scroll-area');
      if (scrollArea) {
        // 计算相对于滚动区域的偏移量
        // projectEl.offsetTop gives the position relative to the nearest positioned ancestor
        // Let's use getBoundingClientRect for safety
        setTimeout(() => {
          const scrollAreaRect = scrollArea.getBoundingClientRect();
          const projectRect = projectEl.getBoundingClientRect();
          const scrollTop = scrollArea.scrollTop;

          // top position of project relative to the scroll area's content
          const targetY = projectRect.top - scrollAreaRect.top + scrollTop;

          // Scroll to target minus the 20px fixed top bar and an extra ~50px (~2 lines)
          scrollArea.scrollTo({
            top: targetY - 20,
            behavior: 'smooth'
          });
        }, 300); // Wait for footer to finish expanding
      }
    }
  } else {
    // Fallback if the element doesn't exist on this page
    window.location.href = link;
  }
}

// 只在 hover "Zhenzhen Guo" 时显示 gzz.png 背景
if (nameLink) {
  nameLink.addEventListener('mouseenter', () => {
    document.body.classList.add('show-portrait');
  });
  nameLink.addEventListener('mouseleave', () => {
    document.body.classList.remove('show-portrait');
  });
}

// ===== Floorplan as interactive map =====
const container = document.querySelector('.floorplan-container');
const svg = document.querySelector('.floorplan');

/*
if (container && svg) {
  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  const minScale = 1;
  const maxScale = 5;

  let isPanning = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;

  // touch state
  let touchMode = null; // "pan" | "zoom" | null
  let initialDistance = 0;
  let initialScale = 1;
  let touchCenter = { x: 0, y: 0 }; // We want the room strokes to visually represent ~1.9px on screen
  const BASE_STROKE_WIDTH = 1.9;   // px
  const VIEWBOX_WIDTH = 1000;    // SVG viewBox 宽度

  function getRoomLabelFontSizePx() {
    const nameEl = document.querySelector('.name');
    if (nameEl) {
      return parseFloat(getComputedStyle(nameEl).fontSize) || 16;
    }
    return 16;
  }

  let swayTime = 0;
  let animFrameId = null;

  function applyTransform() {
    // 平移+缩放：房间形状会变大变小
    // Add a natural idle sway when not being interacted with
    let currentSwayX = 0;
    let currentSwayY = 0;

    if (!isPanning && touchMode === null && !isDraggingFooterActive()) {
      // 叠加两个正弦波制造少许无规律感自然晃动
      currentSwayX = Math.sin(swayTime * 0.001) * 8 + Math.cos(swayTime * 0.0015) * 5;
      currentSwayY = Math.cos(swayTime * 0.0012) * 8 + Math.sin(swayTime * 0.0008) * 5;
    }

    const finalSwayX = 0.5 * currentSwayX;
    const finalSwayY = 0.5 * currentSwayY;

    svg.style.transform = `translate(${translateX + finalSwayX}px, ${translateY + finalSwayY}px) scale(${scale})`;
    svg.style.transformOrigin = '0 0';
    svg.style.setProperty('--map-scale', scale);

    const trailContainer = document.getElementById('mouseTrail');
    if (trailContainer) {
      trailContainer.style.transform = `translate(${finalSwayX}px, ${finalSwayY}px)`;
    }
  }

  function updateVisualScales() {
    const containerWidth = container.getBoundingClientRect().width;
    let svgDisplayWidth = containerWidth * 1.2; // .floorplan 现为 120% 宽 (1.5x of 80%)

    // 在手机端，按 70vh 高度算出来的实际宽度
    if (window.innerWidth <= 768) {
      svgDisplayWidth = svg.getBoundingClientRect().width / scale;
    }

    const scaleFromViewBoxToPx = svgDisplayWidth / VIEWBOX_WIDTH;
    const effectivePxPerViewBoxUnit = scaleFromViewBoxToPx * scale;

    // 线条：屏幕视觉粗细恒定，不随视口宽度或缩放变化（用 viewBox 单位反算）
    const strokeInViewBox = BASE_STROKE_WIDTH / effectivePxPerViewBoxUnit;
    svg.querySelectorAll('.room-stroke, .outline, .room-label-circle').forEach((el) => {
      el.style.strokeWidth = `${strokeInViewBox}`; // 无单位 = viewBox 单位
    });

    // room-label：屏幕视觉字号与导航栏 "Zhenzhen Guo" 一致
    const targetLabelPx = getRoomLabelFontSizePx();
    const fontSizeInViewBox = targetLabelPx / effectivePxPerViewBoxUnit;
    svg.querySelectorAll('.room-label').forEach((el) => {
      el.style.fontSize = `${fontSizeInViewBox}`;
    });

    // room-label 黑色圆的半径：屏幕像素恒定
    const LABEL_CIRCLE_RADIUS_PX = 12;
    const circleRInViewBox = LABEL_CIRCLE_RADIUS_PX / effectivePxPerViewBoxUnit;
    svg.querySelectorAll('.room-label-circle').forEach((el) => {
      el.setAttribute('r', String(circleRInViewBox));
    });
  }

  function renderLoop(time) {
    swayTime = time;
    applyTransform();
    animFrameId = requestAnimationFrame(renderLoop);
  }

  // To prevent sway while interacting with footer
  function isDraggingFooterActive() {
    return window.isDraggingFooter === true; // we will expose this in the footer logic
  }

  window.addEventListener('resize', () => {
    updateVisualScales();
    applyTransform();
  });

  updateVisualScales(); // 初始加载时也设定线条粗细与字号
  animFrameId = requestAnimationFrame(renderLoop);

  function clampScale(value) {
    return Math.min(maxScale, Math.max(minScale, value));
  }

  function getContainerPoint(clientX, clientY) {
    const rect = container.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  function zoomAt(clientX, clientY, deltaScale) {
    const newScale = clampScale(scale * deltaScale);
    const rect = container.getBoundingClientRect();

    // current point in content coordinates
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const contentX = (px - translateX) / scale;
    const contentY = (py - translateY) / scale;

    // update translate so the point under cursor stays in place
    translateX = px - contentX * newScale;
    translateY = py - contentY * newScale;

    scale = newScale;
    updateVisualScales();
    // applyTransform() will be called automatically by requestAnimationFrame
  }

  // Mouse wheel zoom
  container.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();

      const zoomIntensity = 0.0015;
      const delta = -event.deltaY * zoomIntensity;
      const factor = 1 + delta;

      if (factor <= 0) return;
      zoomAt(event.clientX, event.clientY, factor);
    },
    { passive: false }
  );

  // Mouse drag pan
  container.addEventListener('mousedown', (event) => {
    // ignore if clicking directly on a room (let click trigger navigation)
    if (event.target.classList && event.target.classList.contains('room')) {
      return;
    }

    isPanning = true;
    startX = event.clientX;
    startY = event.clientY;
    lastX = translateX;
    lastY = translateY;
    container.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (event) => {
    if (!isPanning) return;
    const dx = event.clientX - startX;
    const dy = event.clientY - startY;
    translateX = lastX + dx;
    translateY = lastY + dy;
    // applyTransform() will be called automatically by requestAnimationFrame
  });

  window.addEventListener('mouseup', () => {
    isPanning = false;
    container.style.cursor = 'default';
  });

  // Touch helpers
  function distanceBetweenTouches(t1, t2) {
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function midpoint(t1, t2) {
    return {
      x: (t1.clientX + t2.clientX) / 2,
      y: (t1.clientY + t2.clientY) / 2,
    };
  }

  // Touch start
  container.addEventListener(
    'touchstart',
    (event) => {
      if (event.touches.length === 1) {
        touchMode = 'pan';
        const t = event.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        lastX = translateX;
        lastY = translateY;
      } else if (event.touches.length === 2) {
        touchMode = 'zoom';
        const [t1, t2] = event.touches;
        initialDistance = distanceBetweenTouches(t1, t2);
        initialScale = scale;
        touchCenter = midpoint(t1, t2);
      }
    },
    { passive: false }
  );

  // Touch move
  container.addEventListener(
    'touchmove',
    (event) => {
      event.preventDefault();

      if (touchMode === 'pan' && event.touches.length === 1) {
        const t = event.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        translateX = lastX + dx;
        translateY = lastY + dy;
        // applyTransform() automatically called via RAF
      } else if (touchMode === 'zoom' && event.touches.length === 2) {
        const [t1, t2] = event.touches;
        const currentDistance = distanceBetweenTouches(t1, t2);
        if (initialDistance === 0) return;
        const factor = currentDistance / initialDistance;

        const newScale = clampScale(initialScale * factor);
        const rect = container.getBoundingClientRect();

        const px = touchCenter.x - rect.left;
        const py = touchCenter.y - rect.top;

        const contentX = (px - translateX) / scale;
        const contentY = (py - translateY) / scale;

        translateX = px - contentX * newScale;
        translateY = py - contentY * newScale;

        scale = newScale;
        updateVisualScales();
        // applyTransform() automatically called via RAF
      }
    },
    { passive: false }
  );

  container.addEventListener('touchend', () => {
    if (touchMode === 'zoom' || touchMode === 'pan') {
      // reset mode when fingers leave
      touchMode = null;
    }
  });

  // Click on rooms to go to projects (now scrolls instead)
  svg.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof SVGElement)) return;
    if (!target.classList.contains('room')) return;

    const link = target.getAttribute('data-link');
    if (link && link !== '#') {
      scrollToProject(link);
    }
  });
  // 不再强行用 JS 重新计算居中，默认保持 scale=1、translate=0
  // 这样由 CSS 的 flex 布局让 SVG 自然居中，避免跑到角落
}
*/

// ===== Hover Preview Logic =====
const hoverPreviewContainer = document.getElementById('hover-preview-container');

function showProjectPreview(targetLink) {
  if (!hoverPreviewContainer || !targetLink || targetLink === '#') return;
  const projectId = 'project-' + targetLink.replace('.html', '');
  const projectElement = document.getElementById(projectId);
  if (projectElement) {
    let previewHtml = '';

    // Special overrides for 4 (Changwon) and 6 (GOKLOK)
    if (targetLink.includes('changwon-atlas')) {
      previewHtml = `<video src="assets/images/changwon/web1.mp4" autoplay loop muted playsinline></video>`;
    } else if (targetLink.includes('goklok')) {
      previewHtml = `<img src="assets/images/goklok/logo.png" alt="Preview" />`;
    } else {
      // Default: find the first image or video in this project
      const mediaItem = projectElement.querySelector('img, video');
      if (mediaItem) {
        if (mediaItem.tagName === 'IMG') {
          previewHtml = `<img src="${mediaItem.src}" alt="Preview" />`;
        } else if (mediaItem.tagName === 'VIDEO') {
          const src = mediaItem.src || mediaItem.querySelector('source')?.src;
          previewHtml = `<video src="${src}" autoplay loop muted playsinline></video>`;
        }
      }
    }

    if (previewHtml) {
      hoverPreviewContainer.innerHTML = previewHtml;

      // Determine explicit width scale based on user per-project request
      // 3 (pin-stencil) stays default 1x
      // 6 (goklok) goes extra large 1.8x
      // Others go to 1.5x
      let customWidth = '50vw'; // Default ~1.5x of the original 40vw base
      let customMaxWidth = '500px';
      let customHeight = '50vh';
      let customMaxHeight = '500px';

      if (targetLink.includes('pin-stencil')) {
        customWidth = '50vw';
        customMaxWidth = '500px';
      } else if (targetLink.includes('goklok')) {
        customWidth = '90vw';
        customMaxWidth = '1000px';
      } else if (targetLink.includes('slice-wardrobe')) {
        customWidth = '60vw';
        customMaxWidth = '600px';
      } else if (targetLink.includes('changwon-atlas')) {
        // customWidth = '80vw';
        // customMaxWidth = '800px';
        customWidth = '80vw';
        customHeight = '40vh';
        customMaxHeight = '600px';
        customMaxWidth = '400px';
      } else if (targetLink.includes('street-view-fails')) {
        customWidth = '90vw';
        customMaxWidth = '900px';
      } else if (targetLink.includes('wisdom-tree-cafe')) {
        customWidth = '90vw';
        customMaxWidth = '900px';
      } else if (targetLink.includes('integrated-design-dimensions')) {
        customHeight = '80vh';
        customMaxHeight = '800px';
        customMaxWidth = '450px';
      }

      if (targetLink.includes('integrated-design-dimensions')) {
        hoverPreviewContainer.style.height = customHeight;
        hoverPreviewContainer.style.maxHeight = customMaxHeight;
        hoverPreviewContainer.style.maxWidth = customMaxWidth;
        hoverPreviewContainer.style.opacity = '1';
      } else {
        hoverPreviewContainer.style.width = customWidth;
        hoverPreviewContainer.style.maxWidth = customMaxWidth;
        hoverPreviewContainer.style.opacity = '1';
      }

      // Calculate the vertical center of the available space above the collapsed footer (70px height)
      const availableHeight = window.innerHeight - 70;
      hoverPreviewContainer.style.top = (availableHeight / 2) + 'px';
    }
  }
}

function hideProjectPreview() {
  if (hoverPreviewContainer) {
    hoverPreviewContainer.style.opacity = '0';
    // optionally clear innerHTML after transition, but opacity is enough
  }
}

// ===== Menu Item Hover -> Room Highlight =====
const menuItems = document.querySelectorAll('[data-target-link]');
if (menuItems.length > 0) {
  menuItems.forEach((item) => {
    // Add cursor style to indicate interactivity since we attached click handler
    item.style.cursor = 'pointer';

    item.addEventListener('mouseenter', () => {
      const targetLink = item.getAttribute('data-target-link');
      if (!targetLink) return;

      showProjectPreview(targetLink);

      // Find the corresponding room group
      if (svg) {
        const roomGroup = svg.querySelector(`.room[data-link="${targetLink}"]`);
        if (roomGroup) {
          roomGroup.classList.add('active');
        }
      }
    });

    item.addEventListener('mouseleave', () => {
      const targetLink = item.getAttribute('data-target-link');
      if (!targetLink) return;

      hideProjectPreview();

      if (svg) {
        const roomGroup = svg.querySelector(`.room[data-link="${targetLink}"]`);
        if (roomGroup) {
          roomGroup.classList.remove('active');
        }
      }
    });

    // Optional: Click to navigate (makes the menu functional)
    item.addEventListener('click', () => {
      const targetLink = item.getAttribute('data-target-link');
      if (targetLink && targetLink !== '#') {
        scrollToProject(targetLink);
      }
    });
  });
}

/*
// Add direct hover and click events for the SVG rooms themselves
const svgRooms = document.querySelectorAll('.room');
svgRooms.forEach(roomGroup => {
  const hitbox = roomGroup.querySelector('.room-hitbox');
  const targetLink = roomGroup.getAttribute('data-link');

  // Navigate to project when clicking the room
  roomGroup.addEventListener('click', () => {
    if (targetLink && targetLink !== '#') {
      scrollToProject(targetLink);
    }
  });

  roomGroup.addEventListener('mouseenter', () => {
    showProjectPreview(targetLink);
  });

  roomGroup.addEventListener('mouseleave', () => {
    hideProjectPreview();
  });
});
*/

// ===== Pull-up Footer Logic =====
const footer = document.getElementById('projectsFooter');
const dragBar = document.getElementById('footerDragBar');

if (footer && dragBar) {
  window.isDraggingFooter = false; // Exposed to window so top floorplan layer can read it
  let startY = 0;
  let startHeight = 0;
  const MIN_HEIGHT = 70; // MUST match CSS .footer-top-bar height

  function setFooterHeight(h) {
    // header is approx 60px. Max height should leave header visible or stop below menu-panel.
    // Ensure the footer line does not cross above the allowed limit.
    const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);
    let newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, h));
    footer.style.height = newHeight + 'px';
  }

  // Mouse events
  dragBar.addEventListener('mousedown', (e) => {
    // Don't drag if they clicked on the index button or something else interactive inside the top bar
    if (e.target.closest('#indexToggleBtn')) return;

    window.isDraggingFooter = true;
    startY = e.clientY;
    startHeight = footer.offsetHeight;
    footer.style.transition = 'none'; // remove transition for instant drag
    document.body.style.userSelect = 'none'; // prevent text selection while dragging
  });

  window.addEventListener('mousemove', (e) => {
    if (!window.isDraggingFooter) return;
    // delta is positive when moving mouse UP the screen (smaller clientY)
    const dy = startY - e.clientY;
    setFooterHeight(startHeight + dy);
  });

  window.addEventListener('mouseup', () => {
    if (window.isDraggingFooter) {
      window.isDraggingFooter = false;
      document.body.style.userSelect = '';

      // Snap to full open or full close based on threshold
      const currentHeight = footer.offsetHeight;
      const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);

      footer.style.transition = 'height 0.3s ease';

      if (currentHeight > MIN_HEIGHT + 100) {
        // if pulled up enough, snap to top
        setFooterHeight(MAX_HEIGHT);
      } else {
        // else snap to bottom
        setFooterHeight(MIN_HEIGHT);
      }
    }
  });

  // Touch events for mobile
  dragBar.addEventListener('touchstart', (e) => {
    if (e.target.closest('#indexToggleBtn')) return;
    window.isDraggingFooter = true;
    startY = e.touches[0].clientY;
    startHeight = footer.offsetHeight;
    footer.style.transition = 'none';
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!window.isDraggingFooter) return;
    const dy = startY - e.touches[0].clientY;
    setFooterHeight(startHeight + dy);
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (window.isDraggingFooter) {
      window.isDraggingFooter = false;
      const currentHeight = footer.offsetHeight;
      const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);

      footer.style.transition = 'height 0.3s ease';
      if (currentHeight > MIN_HEIGHT + 100) {
        setFooterHeight(MAX_HEIGHT);
      } else {
        setFooterHeight(MIN_HEIGHT);
      }
    }
  });

  // Handle window resizing dynamically
  window.addEventListener('resize', () => {
    const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);

    // If footer is drawn beyond the allowed boundary, crush it down immediately
    if (footer.offsetHeight > MAX_HEIGHT) {
      footer.style.transition = 'none';
      setFooterHeight(MAX_HEIGHT);
    }
    // If it is currently "pulled up" (meaning height is large), we should snap it back to full max height when window resizes 
    // so it doesn't leave an awkward gap
    else if (footer.offsetHeight > MIN_HEIGHT + 10) {
      // Allow a 50px tolerance
      if (footer.offsetHeight >= MAX_HEIGHT - 50) {
        footer.style.transition = 'none';
        setFooterHeight(MAX_HEIGHT);
      }
    }
  });
}

// ===== Scrub Video Logic (Desktop Hover, Mobile Autoplay) =====
(function initScrubVideos() {
  const scrubContainers = document.querySelectorAll('.scrub-video-container');
  if (!scrubContainers.length) return;

  function handleResize() {
    const isMobile = window.innerWidth <= 768;
    scrubContainers.forEach(container => {
      const video = container.querySelector('video');
      if (!video) return;

      if (isMobile) {
        // Mobile: Autoplay, remove scrubbing
        video.autoplay = true;
        video.play().catch(() => { }); // catch autoplay restrictions if any
        container.style.cursor = 'default';
        container.onmousemove = null;
        container.onmouseleave = null;
      } else {
        // Desktop: Pause, enable scrubbing
        video.autoplay = false;
        video.pause();
        container.style.cursor = 'col-resize';

        container.onmousemove = (e) => {
          if (!video.duration) return; // Video not loaded yet
          const rect = container.getBoundingClientRect();
          let x = e.clientX - rect.left;
          x = Math.max(0, Math.min(x, rect.width));

          const progress = x / rect.width;
          // Use raf or direct assignment. Direct is usually fine for local videos
          video.currentTime = progress * video.duration;
        };

        container.onmouseleave = () => {
          // Optional: reset to 0 or leave it where it was
          // video.currentTime = 0; 
        };
      }
    });
  }

  window.addEventListener('resize', handleResize);
  // Initial check
  handleResize();
})();

// ===== Scroll Reveal Animation for Images and Videos =====
(function initScrollReveal() {
  const mediaElements = document.querySelectorAll('.footer-project-item img, .footer-project-item video');

  mediaElements.forEach(el => {
    el.classList.add('reveal-on-scroll');
  });

  const observerOptions = {
    root: document.querySelector('.footer-scroll-area'),
    rootMargin: '20px 0px',
    threshold: 0.05
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  mediaElements.forEach(el => {
    observer.observe(el);
  });
})();

// ===== Initialize Page State =====
(function initPageState() {
  const panel = document.getElementById('menuPanel');
  const footer = document.getElementById('projectsFooter');

  // If the panel is hidden on load, automatically expand the footer.
  if (panel && footer && getComputedStyle(panel).display === 'none') {
    const MAX_HEIGHT = typeof getFooterMaxHeight === 'function' ? getFooterMaxHeight() : (window.innerHeight - 60);
    // Expand instantly to avoid animation delay during page load
    footer.style.transition = 'none';
    footer.style.height = MAX_HEIGHT + 'px';
  }
})();
