salla.onReady(async () => {
  const {
    wrapper,
    tabsContainer,
    contentContainer,
    subcategoryContainer,
    toggleBtn,
    iconOpen,
    iconClose,
    header,
    siteHeaderMobile,
    isRTL
  } = getDOMElements();

  
  setupInitialPanelState({ wrapper, subcategoryContainer, isRTL });
  updateHeaderOffset(header);

  document.addEventListener("closeMobileMenu", () => {
  closeMobileMenu({ wrapper, subcategoryContainer, iconOpen, iconClose, isRTL, siteHeaderMobile });
});


  toggleBtn.addEventListener("click", () => {
    toggleMobileMenu({ wrapper, subcategoryContainer, iconOpen, iconClose, isRTL, contentContainer, siteHeaderMobile });
  });

  try {
    await loadAndRenderMenu(tabsContainer, contentContainer, category =>
      renderSubcategories(category, subcategoryContainer)
    );
  } catch (err) {
    console.error("Error building mobile menu:", err);
  }
});


// -------------------- Utilities & Components --------------------

function getDOMElements() {
  return {
    wrapper: document.getElementById("mobile-menu-overlay"),
    tabsContainer: document.getElementById("mobile-menu-tabs"),
    contentContainer: document.getElementById("mobile-menu-content"),
    subcategoryContainer: document.getElementById("mobile-subcategory-content"),
    toggleBtn: document.getElementById("mobile-menu-toggle"),
    iconOpen: document.getElementById("icon-open"),
    iconClose: document.getElementById("icon-close"),
    header: document.querySelector(".store-header"),
    siteHeaderMobile : document.querySelector('.site-header-mobile'),
    isRTL: document.dir === "rtl"
  };
}

  function isHomePage() {
  return window.isHomePage === true;
}

function setupInitialPanelState({ wrapper, subcategoryContainer, isRTL }) {
  wrapper.classList.add(isRTL ? "translate-x-full" : "-translate-x-full");
  subcategoryContainer.classList.add(isRTL ? "-translate-x-full" : "translate-x-full");
  subcategoryContainer.style.visibility = "hidden";
}

function updateHeaderOffset(header) {
  const height = header?.getBoundingClientRect().height || 60;
  document.documentElement.style.setProperty('--header-height', `${height}px`);
}

function toggleMobileMenu({ wrapper, subcategoryContainer, iconOpen, iconClose, isRTL, contentContainer ,siteHeaderMobile}) {
  const isOpen = isRTL
    ? !wrapper.classList.contains("translate-x-full")
    : !wrapper.classList.contains("-translate-x-full");

  if (isOpen) {
    closeMobileMenu({ wrapper, subcategoryContainer, iconOpen, iconClose, isRTL ,siteHeaderMobile});
  } else {
    document.dispatchEvent(new CustomEvent("closeSearchPanel"));
    wrapper.classList.remove(isRTL ? "translate-x-full" : "-translate-x-full");
    iconOpen.classList.add("hidden");
    iconClose.classList.remove("hidden");
    subcategoryContainer.scrollTop = 0;
    contentContainer.scrollTop = 0;
    if (siteHeaderMobile) siteHeaderMobile.style.color =  window.header_text_color;
    document.body.style.overflow = 'hidden'; 
  }
}

function closeMobileMenu({ wrapper, subcategoryContainer, iconOpen, iconClose, isRTL,siteHeaderMobile }) {
  wrapper.classList.add(isRTL ? "translate-x-full" : "-translate-x-full");
  subcategoryContainer.classList.add(isRTL ? "-translate-x-full" : "translate-x-full");
  subcategoryContainer.style.visibility = "hidden";
  iconOpen.classList.remove("hidden");
  iconClose.classList.add("hidden");
  if (siteHeaderMobile) siteHeaderMobile.style.color = isHomePage() ? "white" : window.header_text_color;
  document.body.style.overflow = ''; 
}


// -------------------- Menu Rendering --------------------

async function loadAndRenderMenu(tabsContainer, contentContainer, renderSubcategories) {
  const { data: menus } = await salla.api.component.getMenus();
  if (!menus?.length) return;

  tabsContainer.innerHTML = "";

  menus.forEach((menu, index) => {
    const tab = document.createElement("button");
    tab.textContent = menu.title;
    tab.className = `relative flex justify-center items-center gap-[8px] px-[8px] py-[4px] whitespace-nowrap ${
      index === 0 ? "text-black border-b-2 border-black" : "text-gray-500"
    }`;

    tab.addEventListener("click", () => {
      [...tabsContainer.children].forEach(btn => {
        btn.classList.remove("text-black", "border-b-2", "border-black");
        btn.classList.add("text-gray-500");
      });
      tab.classList.remove("text-gray-500");
      tab.classList.add("text-black", "border-b-2", "border-black");

      renderMenuContent(menu, contentContainer, renderSubcategories);
    });

    tabsContainer.appendChild(tab);
  });

  renderMenuContent(menus[0], contentContainer, renderSubcategories);
}

function renderMenuContent(menu, contentContainer, renderSubcategories) {
  contentContainer.innerHTML = "";

  // If the menu has no children at all
  if (!menu.children || menu.children.length === 0) {
    const emptyBlock = document.createElement("div");
    emptyBlock.className = "mb-4";

    const link = document.createElement("a");
    link.href = menu.url || "#";
    link.className = "flex items-center gap-2 p-[12px_0_12px_8px] cursor-pointer text-[#27272A] font-sans text-[14px] font-medium leading-[24px] tracking-[0.4px]";
    
  
      link.textContent = window.languageCode === "ar" ? "عرض الكل" : "Show All";
   

    emptyBlock.appendChild(link);
    contentContainer.appendChild(emptyBlock);
    return;
  }

  menu.children.forEach(child => {
    const block = document.createElement("div");
    block.className = "mb-4";

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "flex items-center justify-between gap-2 p-[12px_0_12px_8px]";
    
    // Create the text link that always goes to the category page
    const titleLink = document.createElement("a");
    titleLink.href = child.url;
    titleLink.className = "flex-1 text-[#27272A] font-sans text-[14px] font-medium leading-[24px] tracking-[0.4px]";
    titleLink.textContent = child.title;
    
    titleWrapper.appendChild(titleLink);

    // Add arrow icon if there are subcategories and advanced menu is enabled
    if (window.isAdvancedMenuEnabled && child.children && child.children.length > 0) {
      const icon = createArrowIcon();
      if (document.dir === "rtl") icon.style.transform = "rotate(180deg)";
      
      // Make the arrow clickable to show subcategories
      icon.style.cursor = "pointer";
      icon.addEventListener("click", () => {
        renderSubcategories(child);
      });
      
      titleWrapper.appendChild(icon);
    }
    // If no subcategories, we could optionally add a different indicator or nothing
    // The titleLink already handles navigation to the category page

    block.appendChild(titleWrapper);
    contentContainer.appendChild(block);
  });
}

function createArrowIcon() {
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("width", "24");
  icon.setAttribute("height", "24");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("fill", "none");
  icon.innerHTML = `
    <path d="M10 7L15 12L10 17" stroke="#27272A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  `;
  return icon;
}


// -------------------- Subcategory Panel --------------------

function renderSubcategories(category, subcategoryContainer) {
  const rtl = document.dir === "rtl";
  subcategoryContainer.innerHTML = "";

  const backBtn = document.createElement("div");
  backBtn.className = "flex pr-[16px] items-center gap-[8px] self-stretch cursor-pointer p-[12px_16px] text-gray-600 border-t border-b text-sm font-semibold";

  const backText = document.createElement("span");
  backText.className = "text-[#27272A] font-sans text-[14px] font-medium leading-[24px] tracking-[0.4px]";
  backText.textContent = category.title;

  const icon = createArrowIcon();
  if (!rtl) icon.style.transform = "rotate(180deg)";

  backBtn.appendChild(icon);
  backBtn.appendChild(backText);

  backBtn.addEventListener("click", () => {
    subcategoryContainer.classList.add(rtl ? "-translate-x-full" : "translate-x-full");
    setTimeout(() => {
      subcategoryContainer.style.visibility = "hidden";
    }, 500);
  });

  subcategoryContainer.appendChild(backBtn);

  const subcategoryContent = document.createElement("div");
  subcategoryContent.className = "flex h-[670px] p-[8px_16px_8px_20px] flex-col items-start gap-[12px] shrink-0 self-stretch";

  const list = document.createElement("ul");
  list.className = "flex flex-col items-start self-stretch";

  const imageContainer = document.createElement("div");
  imageContainer.className = "grid grid-cols-3 gap-4";

  let imageCount = 0;
  const subItems = category.children ?? [];

  if (!subItems.length) {
    const li = document.createElement("li");
    li.className = "flex p-[12px_0_12px_8px] flex-col items-start gap-[10px] self-stretch";

    const a = document.createElement("a");
    a.href = category.url ?? "#";
    a.textContent = window.languageCode === "ar" ? "تسوق الكل" : "Shop All";
    a.className = "text-[#27272A] font-sans text-[14px] font-medium leading-[24px] tracking-[0.4px]";

    li.appendChild(a);
    list.appendChild(li);
  } else {
    subItems.forEach(sub => {
      const li = document.createElement("li");
      li.className = "flex p-[12px_0_12px_8px] flex-col items-start gap-[10px] self-stretch";

      const a = document.createElement("a");
      a.href = sub.url;
      a.textContent = sub.title;
      a.className = "text-[#27272A] font-sans text-[14px] font-medium leading-[24px] tracking-[0.4px]";

      li.appendChild(a);
      list.appendChild(li);

      if (sub.image && imageCount < 3) {
        const link = document.createElement("a");
        link.href = sub.url;

        const img = document.createElement("img");
        img.src = sub.image;
        img.alt = sub.title;
        img.className = "w-full h-auto object-cover";

        link.appendChild(img);
        imageContainer.appendChild(link);
        imageCount++;
      }
    });
  }

  subcategoryContent.appendChild(list);
  subcategoryContent.appendChild(imageContainer);
  subcategoryContainer.appendChild(subcategoryContent);

  subcategoryContainer.style.visibility = "visible";
  subcategoryContainer.classList.remove(rtl ? "-translate-x-full" : "translate-x-full");
}
