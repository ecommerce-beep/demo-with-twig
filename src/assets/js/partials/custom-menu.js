salla.onReady(async () =>  {




  const wrapper = document.getElementById("custom-mega-menu-wrapper");
  const tabs = document.getElementById("menu-tabs");
  const megaContent = document.getElementById("mega-content");
  const childList = document.getElementById("mega-childs");
  const subList = document.getElementById("mega-subcategories");
  const imageList = document.getElementById("mega-images");
  const overlay = document.getElementById("mega-overlay-background");
  const header = document.querySelector(".store-header");
  const siteHeader = document.querySelector('.site-header'); 
  const simpleMenu = document.getElementById("simple-menu");
  const simpleMenuList = document.getElementById("simple-menu-list");
  const categoryTitle = document.getElementById("mega-category-title");

  let menus = [];
  let hideTimeout;
  let activeTabUnderline = null;


  function isHomePage() {
  return window.isHomePage === true;
}





  function showMenu(tabElement, index) {
    clearTimeout(hideTimeout);
     
      if (header) header.style.backgroundColor = window.header_bg_color;
       if (siteHeader) siteHeader.style.color =  window.header_text_color;
    overlay?.classList.remove("hidden");

    if (window.isAdvancedMenuEnabled) {
      toggleClass(megaContent, true);
    } else {
      positionSimpleMenu(tabElement);
      toggleClass(simpleMenu, true);
    }

    // underline effect
    if (activeTabUnderline) {
      activeTabUnderline.style.width = "0";
    }
    const newUnderline = tabElement.querySelector("span");
    if (newUnderline) {
      newUnderline.style.width = "100%";
      activeTabUnderline = newUnderline;
    }
  }
function hideMenu() {

  overlay?.classList.add("hidden");
  toggleClass(megaContent, false);
  toggleClass(simpleMenu, false);

  if (header) header.style.backgroundColor = "";
  if (siteHeader) siteHeader.style.color = isHomePage() ? "white" : window.header_text_color;

  if (activeTabUnderline) {
    activeTabUnderline.style.width = "0";
    activeTabUnderline = null;
  }
}



  function toggleClass(el, show) {
    if (!el) return;
    el.classList.toggle("scale-y-0", !show);
    el.classList.toggle("opacity-0", !show);
    el.classList.toggle("pointer-events-none", !show);
    el.classList.toggle("-translate-y-full", !show);
    el.classList.toggle("scale-y-100", show);
    el.classList.toggle("opacity-100", show);
    el.classList.toggle("translate-y-0", show);
  }

  function positionSimpleMenu(tabElement) {
    const tabRect = tabElement.getBoundingClientRect();
    const isRTL = document.dir === "rtl";
    const menuWidth = simpleMenu.offsetWidth;

    simpleMenu.style.left = isRTL
      ? `${tabRect.right - menuWidth}px`
      : `${tabRect.left}px`;
  }

  function renderMenu(index, tabElement) {
    const menu = menus[index];
    if (!menu?.children?.length) return;

    // Clear previous content
    childList.innerHTML = "";
    subList.innerHTML = "";
    imageList.innerHTML = "";
    simpleMenuList.innerHTML = "";
    if (categoryTitle) categoryTitle.textContent = "";

    if (window.isAdvancedMenuEnabled) {
      megaContent.classList.remove("hidden");
      simpleMenu.classList.add("hidden");

      menu.children.forEach((child, idx) => {
        const li = createListItem(child.title, child.url, "child");
        li.addEventListener("mouseover", () => renderSubMenu(child));
        childList.appendChild(li);

        if (idx === 0) renderSubMenu(child);
      });
    } else {
      megaContent.classList.add("hidden");
      simpleMenu.classList.remove("hidden");

      menu.children.forEach(child => {
        const li = document.createElement("li");
        li.className =
          "flex items-center gap-[12px] self-stretch text-sm text-zinc-700 hover:underline";

        if (child.image) {
          const img = document.createElement("img");
          img.src = child.image;
          img.alt = child.title;
          img.className = "w-[28px] h-[28px] aspect-[1/1]";
          li.appendChild(img);
        }

        const a = document.createElement("a");
        a.href = child.url || "#";
        a.textContent = child.title;
        a.className =
          "flex flex-1 items-center text-[15.065px] font-semibold leading-[22.597px] tracking-[0.377px] hover:underline";
        li.appendChild(a);

        simpleMenuList.appendChild(li);
      });
    }

    showMenu(tabElement, index);
  }

  function renderSubMenu(category) {
    subList.innerHTML = "";
    imageList.innerHTML = "";
    if (categoryTitle) categoryTitle.textContent = category.title;

    const subItems = category.children ?? [];
    if (!subItems.length) {
      const ul = document.createElement("ul");
      ul.className = "space-y-1 text-sm text-zinc-500 pr-6";

      const li = createListItem(
        window.languageCode === "ar" ? "تسوق الكل" : "Shop All",
        category.url,
        "shop-all"
      );
      ul.appendChild(li);
      subList.appendChild(ul);
      return;
    }

    const colCount = subItems.length > 10 ? 2 : 1;
    const perCol = Math.ceil(subItems.length / colCount);
    let imageCount = 0;

    for (let col = 0; col < colCount; col++) {
      const colUl = document.createElement("ul");
      colUl.className = "space-y-1 text-sm text-zinc-500 pr-6";
      const items = subItems.slice(col * perCol, (col + 1) * perCol);

      items.forEach(sub => {
        const subLi = createListItem(sub.title, sub.url, "subcategory");
        colUl.appendChild(subLi);

        if (sub.image && imageCount < 3) {
          const link = document.createElement("a");
          link.href = sub.url ?? "#";

          const img = document.createElement("img");
          img.src = sub.image;
          img.alt = sub.title;
          img.className = "flex h-[281px] items-start";
          link.appendChild(img);
          imageList.appendChild(link);
          imageCount++;
        }
      });

      subList.appendChild(colUl);
    }
  }

  function createListItem(title, url = "#", type = "default") {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = url;
    a.textContent = title;
    a.className = "hover:text-black hover:underline cursor-pointer";

    if (type === "child") {
      a.className =
        "block w-full text-zinc-500 font-serif text-base font-semibold leading-6 tracking-wide hover:text-zinc-900 hover:underline";
    }

    li.appendChild(a);
    return li;
  }

  // ----------------------------------------
  // Init - Load menu data
  // ----------------------------------------
  try {
    const res = await salla.api.component.getMenus();
    menus = res.data;

    tabs.innerHTML = "";

    menus.forEach((menu, index) => {
      const tab = document.createElement("li");
      tab.className =
        "group relative cursor-pointer h-full flex items-center";
      tab.dataset.index = index;

      const link = document.createElement("a");
      link.href = menu.url || "#";
      link.textContent = menu.title;
      link.className = "block py-1";

      const underline = document.createElement("span");
      underline.className =
        "absolute bottom-0 h-[2px] bg-zinc-800 w-0 transition-all duration-300";
      if (document.dir === "rtl") underline.style.right = "0";
      else underline.style.left = "0";

      tab.appendChild(link);
      tab.appendChild(underline);
      tabs.appendChild(tab);

      tab.addEventListener("mouseover", () => {
        renderMenu(index, tab);
      });

      link.addEventListener("click", e => {
        if (!menu.url || menu.url === "#") e.preventDefault();
      });
    });
  } catch (err) {
    console.error("Error fetching menus:", err);
  }

  // ----------------------------------------
  // Hover & Interaction Events
  // ----------------------------------------
  wrapper?.addEventListener("mouseover", () => clearTimeout(hideTimeout));
  wrapper?.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hideMenu, 200);
  });

  megaContent?.addEventListener("mouseover", () => clearTimeout(hideTimeout));
  megaContent?.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hideMenu, 200);
  });

  simpleMenu?.addEventListener("mouseover", () => clearTimeout(hideTimeout));
  simpleMenu?.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hideMenu, 200);
  });

  overlay?.addEventListener("mouseover", hideMenu);
  overlay?.addEventListener("click", hideMenu);

  //  Fix: handle dynamic links (simple menu click)
  document.addEventListener("click", e => {
    const link = e.target.closest("#simple-menu-list a, #mega-content a");
    if (link) {
      if (link.href && !link.href.endsWith("#")) {
        window.location.href = link.href;
      }
    }
  });

});