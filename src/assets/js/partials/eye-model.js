export const eyeModel = (productId) => {


  const model = document.querySelector(".quick-eye-model");
  const modelContainer = document.querySelector("#quick-eye-container");

  if (!productId || !model || !modelContainer) {
    
    console.warn("Missing required DOM elements or productId");
    return;
  }
    // ========== الدوال الأساسية ==========
  
  // دالة تحويل select إلى radio buttons
  function convertSelectsToRadioButtons(container = document) {
    container.querySelectorAll('.s-product-options-option-content select').forEach(select => {
      if (select.dataset.converted) return;
      select.dataset.converted = "true";

      const name = select.getAttribute('name');
      const wrapper = document.createElement('div');
      wrapper.className = 'radio-options-grid grid grid-cols-4 md:grid-cols-6 mt-3';

      select.querySelectorAll('option').forEach(option => {
        if (!option.value) return;

        const label = document.createElement('label');
        label.className = 'radio-option';

        label.innerHTML = `
          <input type="radio" name="${name}" value="${option.value}" ${option.selected ? 'checked' : ''}>
          <span>${option.textContent.trim()}</span>
        `;

        label.querySelector('input').addEventListener('change', function () {
          select.value = this.value;
          wrapper.querySelectorAll('.radio-option').forEach(el => el.classList.remove('active'));
          label.classList.add('active');
          select.dispatchEvent(new Event('change', { bubbles: true }));
        });

        if (option.selected) {
          label.classList.add('active');
        }

        wrapper.appendChild(label);
      });

      select.parentNode.appendChild(wrapper);
      select.style.display = 'none';

      const titleLabel = select.closest('.s-product-options-option').querySelector('.s-product-options-option-label');
      if (titleLabel && !select.closest('.s-product-options-option').querySelector('.custom-option-title')) {
        const customTitle = titleLabel.cloneNode(true);
        customTitle.classList.add('custom-option-title');
        select.closest('.s-product-options-option').insertBefore(customTitle, select.closest('.s-product-options-option-content'));
      }
    });
  }

  // دالة مسح الخيارات
  function clearProductOptions() {
    const wrapper = document.querySelector('salla-product-options');
    if (!wrapper) return;

    wrapper.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
      radio.checked = false;
      radio.closest('label')?.classList.remove('active');
    });

    wrapper.querySelectorAll('select').forEach(select => {
      select.selectedIndex = 0;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });

    wrapper.querySelectorAll('label.go-to-slide').forEach(label => {
      label.classList.remove('active');
    });

    wrapper.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // تهيئة الخيارات في الـ modal
  function initProductOptionsInModal() {
    // استخدم MutationObserver لمراقبة إضافة العناصر
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.querySelector && node.querySelector('.s-product-options-option-content select')) {
              setTimeout(() => {
                convertSelectsToRadioButtons(modelContainer);
              }, 100);
            }
          });
        }
      });
    });

    observer.observe(modelContainer, { childList: true, subtree: true });

    // تحقق مرة أخرى بعد تأخير
    setTimeout(() => {
      if (modelContainer.querySelector('.s-product-options-option-content select')) {
        convertSelectsToRadioButtons(modelContainer);
      }
    }, 300);
  }



  const eyeHtml = (product) => {

    const getAddButtonLabel = () => {
      if (product.status === "sale" && product.type === "booking")
        return salla.lang.get("pages.cart.book_now");
      if (product.status === "sale")
        return salla.lang.get("pages.cart.add_to_cart");
      if (product.type !== "donating")
        return salla.lang.get("pages.products.out_of_stock");

      return salla.lang.get("pages.products.donation_exceed");
    };
    function initCompareButtons(context = document) {
      context.querySelectorAll(".compare-button").forEach((btn) => {
        btn.addEventListener("click", () => {
          btn.classList.add("loading");
          btn.disabled = true;

          const product = {
            id: btn.getAttribute("data-id"),
            name: btn.getAttribute("data-name"),
            price: btn.getAttribute("data-price"),
            image: { url: btn.getAttribute("data-image") },
            url: btn.getAttribute("data-url"),
            status: btn.dataset.status,
            type: btn.dataset.productType,
            label: btn.dataset.labelAdd,
            rating: btn.dataset.rating,
            weight: btn.dataset.weight,
          };

          window.app.toggleCompare(product);

          setTimeout(() => {
            btn.classList.remove("loading");
            btn.disabled = false;
          }, 500);
        });
      });
    }

    function initUnionButtons(context = document) {
      context.querySelectorAll(".union-button").forEach((btn_union) => {
        btn_union.addEventListener("click", () => {
          salla.event.dispatch("modal::close", "quick-eye-model");

          const productId = btn_union.getAttribute("data-id");
          window.app.related_product_popup(productId);
        });
      });
    }
    const getProductImages = () => {
      const productImages = Array.isArray(product?.images)
        ? product.images
        : [];
      if (!productImages.length) return "";

      const generateImages = (wrapper, className) =>
        productImages
          .map(
            (image, index) => `
					<${wrapper} class="${className}">
						<img
							src="${image?.url}"
							alt="${image?.alt || ""}"
							loading="${index === 0 ? "eager" : "lazy"}"
							width="100%"
							height="100%"
							class="object-cover w-full sm:w-full h-full"
						/>
					</${wrapper}>
				`
          )
          .join("");

      return `
      <div class="flex flex-col gap-1 justify-start h-full">
      
		<salla-slider
	id="thumbs"
	show-controls="false"
	type="thumbs"
	show-thumbs-controls="false"
	class="product-images-slider block flex-grow"
	slider-config='{
		"slidesPerView": 2,
		"spaceBetween": 10,
    "autoplay": {
			"delay": 3000,
			"disableOnInteraction": false
		},
		"breakpoints": {
			"768": {
				"slidesPerView": 1,
				"spaceBetween": 10
			}
		}
	}'
	thumbs-config='{
		"slidesPerView": 3,
		"spaceBetween": 0,
		"direction": "horizontal",
		"breakpoints": {
			"551": { "slidesPerView": 3.5, "spaceBetween": 10 }
		}
	}'
>
  <div slot="items">
    ${generateImages(
      "a",
      "product-image flex h-fit items-center justify-center flex-row-reverse "
    )}
  </div>

  <div slot="thumbs">
    ${generateImages("div", "product-thumbs-image")}
  </div>
</salla-slider>

      </div>

			`;
    };

    const productImagesHTML = getProductImages();

    const getProductName = () => {
      const productName = product?.name || "";
      if (!productName) return "";
      return `
				<h3 class="product-name-text flex items-center ">
					<span class="product-name-item text-font text-[clamp(1rem,0.6429rem+1.5238vw,1.5rem)] leading-[18px] md:leading-[32px] font-medium "> ${productName} </span>
				</h3>
			`;
    };
    function trans(key) {
      const lang = document.documentElement.lang || "ar";

      const messages = {
        ar: {
          pages: {
            cart: {
              brand_single: "أصلي 100%",
              brand_details: "إضغط هنا لمزيد من ماركه:",
            },
          },
        },
        en: {
          pages: {
            cart: {
              brand_single: "Original 100%",
              brand_details: "Click here for more brand:",
            },
          },
        },
      };

      // split key => read nested
      return (
        key.split(".").reduce((obj, part) => {
          return obj?.[part] || null;
        }, messages[lang]) || key
      );
    }

    const getProductBrand = () => {
      const product_brand = product?.brand?.name || "";

      if (!product_brand) return "";
      return `
				<div class="flex items-center gap-4 border border-font-secondary rounded-md !p-2  mb-4">
			<div class="product-brand w-12">
				<a class="brand-logo flex items-center justify-center" href="${
          product?.brand.url
        }" title="${product?.brand.name}">
					<img width="100%" height="100%" class="max-h-full object-contain" src="${
            product?.brand.logo
          }" title="${product?.brand.name}" alt="${product?.brand.name}">
				</a>
			</div>
			<div class="product-brand">
				<h4 class="text-[#008824]">${trans("pages.cart.brand_single")}</h4>
				<p>
					<span>${trans("pages.cart.brand_details")}</span>
					<a class="uppercase brand-logo text-graytext" href="${
            product?.brand.url
          }" title="${product?.brand.name}">${product?.brand.name}</a>
				</p>
			</div>
		</div>
			`;
    };

    const getProductPrice = () => {
      const regularPrice = product.regular_price || "";
      const salePrice = product.sale_price || "";

      if (!regularPrice) return "";
      return `
    <h4 class="product-price-item flex items-center gap-2  " id="product-price-${
      product.id
    }">
      <span class="flex items-center regular-price gap-2">
       
        <span class="price-value font-normal leading-none text-[clamp(1.110625rem,0.8807rem+0.981vw,1.4325rem)] text-primary " data-base-price="${
          salePrice ? salePrice : regularPrice
        }">
          ${salla.money(salePrice ? salePrice : regularPrice)}
        </span>
      </span>


      ${
        salePrice
          ? `<span class="flex items-center sale-price gap-2">
            <span class="price-value line-through text-graytext font-normal text-[clamp(0.7775rem,0.6163rem+0.6876vw,1.003125rem)] leading-[21px] md:leading-[27px]" data-base-price="${regularPrice}">
              ${salla.money(regularPrice)}
            </span>
          </span>`
          : ""
      }
      ${
        getPromotionTitle()
          ? `<div class="promotion-title-content">
									${getPromotionTitle()}
									</div>`
          : ""
      }
    </h4>
  `;
    };

    const getPromotionTitle = () => {
      const promotionTitle = product.promotion_title || "";
      if (!promotionTitle) return "";
      return `
				<p class="promotion-title-item flex  items-center !text-background">
					${promotionTitle}
				</p>
			`;
    };

    const formatDate = (timestampInSeconds) => {
      const d = new Date(timestampInSeconds * 1000);
      if (isNaN(d)) {
        console.warn("Invalid timestamp:", timestampInSeconds);
        return "";
      }
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const getProductDiscount = () => {
      if (!product.discount_ends) return;
      return `<salla-count-down date="${formatDate(
        product?.discount_ends
      )}" class="flex items-center" end-of-day boxed labeled />`;
    };

    const getProductOptions = () => {
      
      if (product?.options?.length == 0) return;
      return `
				<salla-product-options options="${product.options}" product-id="${product.id}"></salla-product-options>
        
			`;
    };

    const getQuantity = () => {
      return `
				<salla-quantity-input max="${product.max_quantity}" value="1" name="quantity" aria-label="Quantity" class="border-gray-200 flex"></salla-quantity-input>
			`;
    };
    function renderWeightBlock() {
      const lang = document.documentElement.lang || "ar";

      const weightMessages = {
        ar: (value, unit) => `${value} ${unit} `,
        en: (value, unit) => `${unit} ${value} `,
      };

      if (!product?.weight) return "";

      const weightParts = product.weight.split(" ");
      const value = weightParts[0] || "";
      const unit = weightParts[1] || "";
      const weightLabel = {
        ar: "الوزن",
        en: "Weight",
      }[lang];

      return `
    <div class="">
      <div class="flex flex-col items-start gap-1.5 pb-4 pt-1">
      <p class="flex gap-1">
      ${weightLabel}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <g clip-path="url(#clip0_85_331)">
          <path d="M16 24H14.5C14.224 24 14 23.776 14 23.5C14 23.224 14.224 23 14.5 23H16C16.551 23 17 22.552 17 22C17 21.448 16.551 21 16 21H14.5C14.224 21 14 20.776 14 20.5V17.5C14 17.224 14.224 17 14.5 17H17.5C17.776 17 18 17.224 18 17.5C18 17.776 17.776 18 17.5 18H15V20H16C17.103 20 18 20.897 18 22C18 23.103 17.103 24 16 24Z" fill="#595959"/>
          <path d="M22.5 24H21.5C20.673 24 20 23.327 20 22.5V18.5C20 17.673 20.673 17 21.5 17H22.5C23.327 17 24 17.673 24 18.5V22.5C24 23.327 23.327 24 22.5 24ZM21.5 18C21.224 18 21 18.225 21 18.5V22.5C21 22.775 21.224 23 21.5 23H22.5C22.776 23 23 22.775 23 22.5V18.5C23 18.225 22.776 18 22.5 18H21.5Z" fill="#595959"/>
          <path d="M10.5 21C4.71 21 0 16.29 0 10.5C0 4.71 4.71 0 10.5 0C16.29 0 21 4.71 21 10.5C21 12.234 20.593 13.878 19.792 15.385C19.663 15.628 19.36 15.724 19.116 15.592C18.872 15.462 18.78 15.159 18.909 14.916C19.633 13.555 20 12.068 20 10.5C20 5.262 15.738 1 10.5 1C5.262 1 1 5.262 1 10.5C1 15.738 5.262 20 10.5 20C10.824 20 11.139 19.981 11.454 19.952C11.737 19.939 11.973 20.131 11.998 20.404C12.023 20.679 11.821 20.923 11.546 20.948C11.201 20.979 10.855 21 10.5 21Z" fill="#595959"/>
          <path d="M10.5 18C6.364 18 3 14.636 3 10.5C3 6.364 6.364 3 10.5 3C14.636 3 18 6.364 18 10.5C18 12.057 17.533 13.54 16.648 14.789C16.488 15.014 16.176 15.067 15.951 14.908C15.726 14.749 15.672 14.436 15.832 14.211C16.596 13.132 17 11.849 17 10.5C17 6.916 14.084 4 10.5 4C6.916 4 4 6.916 4 10.5C4 14.084 6.916 17 10.5 17C10.855 17 11.156 16.977 11.419 16.928C11.694 16.886 11.951 17.059 12.001 17.329C12.051 17.601 11.871 17.861 11.6 17.912C11.277 17.971 10.917 18 10.5 18Z" fill="#595959"/>
          <path d="M10.5 15C10.224 15 10 14.776 10 14.5C10 14.224 10.224 14 10.5 14C12.43 14 14 12.43 14 10.5C14 10.224 14.224 10 14.5 10C14.776 10 15 10.224 15 10.5C15 12.981 12.981 15 10.5 15Z" fill="#595959"/>
          <path d="M6.5 11C6.224 11 6 10.776 6 10.5C6 8.019 8.019 6 10.5 6C10.776 6 11 6.224 11 6.5C11 6.776 10.776 7 10.5 7C8.57 7 7 8.57 7 10.5C7 10.776 6.776 11 6.5 11Z" fill="#595959"/>
          <path d="M10.5 11.5C11.0523 11.5 11.5 11.0523 11.5 10.5C11.5 9.94772 11.0523 9.5 10.5 9.5C9.94772 9.5 9.5 9.94772 9.5 10.5C9.5 11.0523 9.94772 11.5 10.5 11.5Z" fill="#595959"/>
        </g>
        <defs>
          <clipPath id="clip0_85_331">
            <rect width="24" height="24" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      </p>
        <span class="text-[16px] leading-none font-medium text-font">${weightMessages[
          lang
        ](unit, value)}</span>
      </div>
    </div>
  `;
    }

    const submitButton = () => {
      return `
				<salla-add-product-button
					fill="outline"
					width="wide"
					product-id="${product.id}"
					product-status="${product.status}"
					product-type="${product.type}"
					type="submit"
				>
					${
            product.status == "sale"
              ? `<i class="text-base sicon-${
                  product.type == "booking" ? "calendar-time" : "shopping-bag"
                }"></i>`
              : ``
          }
					<span>${
            product.add_to_cart_label
              ? product.add_to_cart_label
              : getAddButtonLabel()
          }</span>
				</salla-add-product-button>
			`;
    };

    const getSinglePage = () => {
      if (!product?.url) return;

      function showDetails() {
        return document.documentElement.lang == "ar"
          ? "تفاصيل المنتج"
          : "Product details";
      }
      return `
				
        <div class="flex  flex-row-reverse max-h-[60px] w-full">
                  <div class="flex-1 flex flex-row items-center justify-center">
                    <a href="${
                      product?.url
                    }" class="button btn-{{ loop.index }} hover:bg-background transition-all duration-500 bg-primary text-background  hover:text-primary text-center px-3 md:py-4 py-2 text-[clamp(0.75rem,0.7985rem+0.3265vw,1rem)] self-center font-semibold w-full leading-[100%] border border-primary" >${showDetails()}</a>
                  </div>
                </div>
			`;
    };

    const getWishlistButton = () => {
      const isInWishlist =
        !salla.config.isGuest() &&
        salla.storage.get("salla::wishlist", []).includes(product.id);

      return `
				<salla-button
					shape="icon"
					fill="outline"
					color="light"
					id="card-wishlist-btn-${product.id}-horizontal"
					aria-label="Add or remove to wishlist"
					class="s-product-card-wishlist-btn animated ${
            isInWishlist
              ? "s-product-card-wishlist-added pulse-anime"
              : "not-added un-favorited"
          }"
					onclick="salla.wishlist.toggle(${product.id})"
					data-id="${product.id}">
					<i class="sicon-heart"></i>
                </salla-button>
			`;
    };

    modelContainer.innerHTML = `
				<div class="grid grid-cols-1 sm:grid-cols-6 gap-10 items-center " id="product-id-${
          product.id
        }">

					${
            productImagesHTML
              ? `<div class="product-images-slider relative sm:col-span-2 h-full">
              <div class="wishlist-container flex flex-col gap-2 items-center absolute  top-2 ltr:right-2 rtl:left-2 z-2"> ${getWishlistButton()}
</div>
							${productImagesHTML}
						</div>`
              : ""
          }

					<div class="product-info sm:col-span-4 flex flex-col gap-3 h-full">
						<div class="promotion-and-wishlist flex items-center gap-2">
							
							
						</div>
            ${
              getProductBrand()
                ? `<div class="product-name">
									${getProductBrand()}
								</div>`
                : ""
            }
						${
              getProductName()
                ? `<div class="product-name">
									${getProductName()}
								</div>`
                : ""
            }
						
						${
              getProductPrice()
                ? `<div class="product-price">
								${getProductPrice()}
							</div>`
                : ""
            }
						${
              getProductDiscount()
                ? `<div class="product-discount">${getProductDiscount()}</div>`
                : ""
            }
						<form class="form product-form flex flex-col gap-3 h-full" enctype="multipart/form-data" method="post" onsubmit="return salla.form.onSubmit('cart.addItem', event)">
							<input type="hidden" name="id" value="${product.id}">
							${
                getProductOptions()
                  ? `<div class="product-options-container ">${getProductOptions()}</div>
                  `
                  : ""
              }
             
${renderWeightBlock()}

              <div class="flex gap-3 flex-row-reverse justify-end items-center">
              
							<div class="product-quantity mt-auto">
              <span>${getQuantity()}</span>
							</div>
              </div>
							<div class="custom-add-to-cart-button mt-auto">
									${submitButton()}
								</div>
						</form>
					</div>
				</div>
			`;
    initCompareButtons(modelContainer);
    initUnionButtons(modelContainer);
  };

  (async () => {
    try {
      const { data } = await salla.api.product.getDetails(productId, [
        "options",
        "images",
        "brand",
      ]);

      eyeHtml(data);
      model.open();

      const qtyInput = modelContainer.querySelector("salla-quantity-input");
      const priceContainer = modelContainer.querySelector(
        `#product-price-${data.id}`
      );

      if (qtyInput && priceContainer) {
        qtyInput.addEventListener("change", (e) => {
          const qty = parseInt(e.target.value) || 1;

          priceContainer.querySelectorAll(".price-value").forEach((el) => {
            const basePrice =
              parseFloat(el.getAttribute("data-base-price")) || 0;
            el.innerHTML = salla
              .money(basePrice * qty)
              .replace(/<i[^>]*class="sicon-sar"[^>]*><\/i>/, "");
          });
        });
      }

      initProductOptionsInModal();

      // 5. إعداد event listener للزر بشكل مباشر
      

      // 6. المراقبة المستمرة للعناصر المضافة
      const checkOptionsInterval = setInterval(() => {
        const selects = modelContainer.querySelectorAll('.s-product-options-option-content select');
        if (selects.length > 0) {
          convertSelectsToRadioButtons(modelContainer);
          clearInterval(checkOptionsInterval);
        }
      }, 100);

      // أوقف الفحص بعد 5 ثواني
      setTimeout(() => {
        clearInterval(checkOptionsInterval);
      }, 5000);

    } catch (error) {
      console.error(`error from fetch product ${error}`);
    }
  })();
};