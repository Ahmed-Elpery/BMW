/**
 * BMW Vehicle Configurator
 * Interactive tool to customize BMW vehicles
 */

class BMWConfigurator {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentModel = null;
    this.configuration = {
      model: null,
      color: null,
      wheels: null,
      interior: null,
      packages: []
    };
    
    this.availableModels = [
      {
        id: 'i4',
        name: 'BMW i4',
        basePrice: 52000,
        image: 'photos/i/BMW i4 Frozen Portimao Blue Metallic.jpg',
        colors: [
          { id: 'blue', name: 'Frozen Portimao Blue', price: 1950, image: 'photos/i/BMW i4 Frozen Portimao Blue Metallic.jpg' },
          { id: 'white', name: 'Alpine White', price: 0, image: 'photos/bmw-m440i-coupé-flyout.avif' },
          { id: 'black', name: 'Black Sapphire', price: 700, image: 'photos/Screenshot 2025-05-17 184859.png' }
        ],
        wheels: [
          { id: 'standard', name: '18" Aerodynamic Wheels', price: 0, image: 'photos/Screenshot 2025-05-17 184725.png' },
          { id: 'sport', name: '19" M Sport Wheels', price: 1500, image: 'photos/Screenshot 2025-05-17 184745.png' }
        ],
        interiors: [
          { id: 'sensatec', name: 'Sensatec Perforated', price: 0, image: 'photos/Screenshot 2025-05-17 184656.png' },
          { id: 'vernasca', name: 'Vernasca Leather', price: 1700, image: 'photos/Screenshot 2025-05-17 184621.png' }
        ]
      },
      {
        id: 'ix',
        name: 'BMW iX',
        basePrice: 84000,
        image: 'photos/i/R.jpeg',
        colors: [
          { id: 'blue', name: 'Phytonic Blue', price: 1500, image: 'photos/Screenshot 2025-05-17 184826.png' },
          { id: 'white', name: 'Mineral White', price: 0, image: 'photos/i/R.jpeg' },
          { id: 'grey', name: 'Sophisto Grey', price: 1200, image: 'photos/Screenshot 2025-05-17 184946.png' }
        ],
        wheels: [
          { id: 'standard', name: '20" Aerodynamic Wheels', price: 0, image: 'photos/Screenshot 2025-05-17 184724.png' },
          { id: 'luxury', name: '22" Luxury Wheels', price: 2000, image: 'photos/Screenshot 2025-05-17 185009.png' }
        ],
        interiors: [
          { id: 'standard', name: 'Standard Interior', price: 0, image: 'photos/Screenshot 2025-05-17 184625.png' },
          { id: 'premium', name: 'Premium Interior', price: 3500, image: 'photos/Screenshot 2025-05-17 184521.png' }
        ]
      },
      {
        id: 'm4',
        name: 'BMW M4 Coupé',
        basePrice: 74000,
        image: 'photos/bmw-m4-coupe-lci-flyout1.avif',
        colors: [
          { id: 'yellow', name: 'Sao Paulo Yellow', price: 1700, image: 'photos/car8prem.png' },
          { id: 'green', name: 'Isle of Man Green', price: 1700, image: 'photos/car5prem.png' },
          { id: 'black', name: 'Frozen Black', price: 2500, image: 'photos/bmw-m4-coupe-lci-flyout1.avif' }
        ],
        wheels: [
          { id: 'standard', name: '19"/20" M Forged Wheels', price: 0, image: 'photos/p11.png' },
          { id: 'competition', name: '20" Competition Wheels', price: 1500, image: 'photos/p22.png' }
        ],
        interiors: [
          { id: 'standard', name: 'Merino Leather', price: 0, image: 'photos/car3prem.jpg' },
          { id: 'premium', name: 'Full Merino Leather', price: 2500, image: 'photos/car4prem.jpg' }
        ]
      },
      {
        id: 'x7',
        name: 'BMW X7',
        basePrice: 78000,
        image: 'photos/bmw-x7-m60i-flyout-031.avif',
        colors: [
          { id: 'white', name: 'Alpine White', price: 0, image: 'photos/bmw-x7-m60i-flyout-031.avif' },
          { id: 'black', name: 'Carbon Black', price: 1200, image: 'photos/car6prem.jpg' },
          { id: 'blue', name: 'Tanzanite Blue', price: 1900, image: 'photos/car7prem.jpg' }
        ],
        wheels: [
          { id: 'standard', name: '21" V-Spoke Wheels', price: 0, image: 'photos/car2prem.jpg' },
          { id: 'luxury', name: '22" Multi-Spoke Wheels', price: 1800, image: 'photos/car1prem.jpg' }
        ],
        interiors: [
          { id: 'standard', name: 'Vernasca Leather', price: 0, image: 'photos/Elegant_design_meet_pleasing_conformt_3to2.webp' },
          { id: 'premium', name: 'Merino Leather', price: 2800, image: 'photos/cosySec.webp' }
        ]
      }
    ];
    
    this.packages = [
      { id: 'premium', name: 'Premium Package', price: 2400, description: 'Head-up Display, Harman Kardon surround sound system' },
      { id: 'drivingAssistance', name: 'Driving Assistance Plus', price: 1700, description: 'Active Cruise Control, Lane Keeping Assistant' },
      { id: 'parking', name: 'Parking Assistance', price: 800, description: 'Surround View, Parking Assistant Plus' },
      { id: 'comfort', name: 'Comfort Package', price: 1200, description: 'Heated steering wheel, Ventilated seats, 4-zone climate control' },
      { id: 'shadowLine', name: 'M Shadowline Package', price: 750, description: 'High-gloss black exterior trim, M Sport brakes' }
    ];
    
    this.init();
  }
  
  init() {
    if (!this.container) {
      console.error('Configurator container not found');
      return;
    }
    
    this.render();
    this.attachEventListeners();
  }
  
  render() {
    // Create the initial configurator UI
    this.container.innerHTML = `
      <div class="configurator-header">
        <h2>Build Your BMW</h2>
        <p>Customize your perfect BMW to match your style and needs</p>
      </div>
      
      <div class="configurator-body">
        <div class="model-selection">
          <h3>Select Model</h3>
          <div class="model-options">
            ${this.availableModels.map(model => `
              <div class="model-option" data-model-id="${model.id}">
                <img src="${model.image}" alt="${model.name}">
                <h4>${model.name}</h4>
                <p class="price">From $${model.basePrice.toLocaleString()}</p>
                <button class="select-model-btn">Select</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
  
  renderConfigurator() {
    const model = this.availableModels.find(m => m.id === this.configuration.model);
    if (!model) return;
    
    this.container.innerHTML = `
      <div class="configurator-header">
        <h2>Configure Your ${model.name}</h2>
        <div class="configurator-tabs">
          <button class="tab-btn active" data-tab="colors">Colors</button>
          <button class="tab-btn" data-tab="wheels">Wheels</button>
          <button class="tab-btn" data-tab="interior">Interior</button>
          <button class="tab-btn" data-tab="packages">Packages</button>
          <button class="tab-btn" data-tab="summary">Summary</button>
        </div>
      </div>
      
      <div class="configurator-body">
        <div class="vehicle-preview">
          <img src="${model.image}" alt="${model.name}">
        </div>
        
        <div class="configuration-options">
          <div class="tab-content active" id="colors-tab">
            <h3>Exterior Color</h3>
            <div class="color-options">
              ${model.colors.map(color => `
                <div class="color-option ${this.configuration.color === color.id ? 'active' : ''}" 
                     data-color-id="${color.id}" data-price="${color.price}" data-image="${color.image}">
                  <div class="color-swatch" style="background-color: ${this.getColorCode(color.id)}"></div>
                  <div class="color-info">
                    <h4>${color.name}</h4>
                    <p class="price">${color.price > 0 ? '+$' + color.price.toLocaleString() : 'Included'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="tab-content" id="wheels-tab">
            <h3>Wheels</h3>
            <div class="wheel-options">
              ${model.wheels.map(wheel => `
                <div class="wheel-option ${this.configuration.wheels === wheel.id ? 'active' : ''}"
                     data-wheel-id="${wheel.id}" data-price="${wheel.price}" data-image="${wheel.image}">
                  <div class="wheel-image">
                    <img src="${wheel.image}" alt="${wheel.name}">
                  </div>
                  <div class="wheel-info">
                    <h4>${wheel.name}</h4>
                    <p class="price">${wheel.price > 0 ? '+$' + wheel.price.toLocaleString() : 'Included'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="tab-content" id="interior-tab">
            <h3>Interior</h3>
            <div class="interior-options">
              ${model.interiors.map(interior => `
                <div class="interior-option ${this.configuration.interior === interior.id ? 'active' : ''}"
                     data-interior-id="${interior.id}" data-price="${interior.price}" data-image="${interior.image}">
                  <div class="interior-image">
                    <img src="${interior.image}" alt="${interior.name}">
                  </div>
                  <div class="interior-info">
                    <h4>${interior.name}</h4>
                    <p class="price">${interior.price > 0 ? '+$' + interior.price.toLocaleString() : 'Included'}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="tab-content" id="packages-tab">
            <h3>Packages & Options</h3>
            <div class="package-options">
              ${this.packages.map(pkg => `
                <div class="package-option ${this.configuration.packages.includes(pkg.id) ? 'active' : ''}"
                     data-package-id="${pkg.id}" data-price="${pkg.price}">
                  <div class="package-info">
                    <h4>${pkg.name}</h4>
                    <p class="description">${pkg.description}</p>
                    <p class="price">+$${pkg.price.toLocaleString()}</p>
                  </div>
                  <div class="package-action">
                    <button class="toggle-package-btn">
                      ${this.configuration.packages.includes(pkg.id) ? 'Remove' : 'Add'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="tab-content" id="summary-tab">
            <h3>Your Configuration</h3>
            <div class="configuration-summary">
              <div class="summary-item">
                <span class="item-name">Base Price</span>
                <span class="item-value">$${model.basePrice.toLocaleString()}</span>
              </div>
              
              ${this.configuration.color ? `
                <div class="summary-item">
                  <span class="item-name">Color: ${this.getColorName(model, this.configuration.color)}</span>
                  <span class="item-value">+$${this.getColorPrice(model, this.configuration.color).toLocaleString()}</span>
                </div>
              ` : ''}
              
              ${this.configuration.wheels ? `
                <div class="summary-item">
                  <span class="item-name">Wheels: ${this.getWheelName(model, this.configuration.wheels)}</span>
                  <span class="item-value">+$${this.getWheelPrice(model, this.configuration.wheels).toLocaleString()}</span>
                </div>
              ` : ''}
              
              ${this.configuration.interior ? `
                <div class="summary-item">
                  <span class="item-name">Interior: ${this.getInteriorName(model, this.configuration.interior)}</span>
                  <span class="item-value">+$${this.getInteriorPrice(model, this.configuration.interior).toLocaleString()}</span>
                </div>
              ` : ''}
              
              ${this.configuration.packages.length > 0 ? `
                <div class="summary-item packages-summary">
                  <span class="item-name">Packages</span>
                  <span class="item-value"></span>
                </div>
                ${this.configuration.packages.map(pkgId => {
                  const pkg = this.packages.find(p => p.id === pkgId);
                  return `
                    <div class="summary-item package-item">
                      <span class="item-name">- ${pkg.name}</span>
                      <span class="item-value">+$${pkg.price.toLocaleString()}</span>
                    </div>
                  `;
                }).join('')}
              ` : ''}
              
              <div class="summary-total">
                <span class="total-label">Total Price</span>
                <span class="total-value">$${this.calculateTotalPrice().toLocaleString()}</span>
              </div>
            </div>
            
            <div class="summary-actions">
              <button class="summary-btn save-config">Save Configuration</button>
              <button class="summary-btn test-drive">Request Test Drive</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="configurator-footer">
        <button class="back-btn">&laquo; Back</button>
        <button class="next-btn">Next &raquo;</button>
      </div>
    `;
    
    this.attachConfiguratorEvents();
  }
  
  attachEventListeners() {
    // Model selection
    const modelOptions = this.container.querySelectorAll('.model-option');
    modelOptions.forEach(option => {
      const selectBtn = option.querySelector('.select-model-btn');
      selectBtn.addEventListener('click', () => {
        const modelId = option.getAttribute('data-model-id');
        this.selectModel(modelId);
      });
    });
  }
  
  attachConfiguratorEvents() {
    // Tab switching
    const tabButtons = this.container.querySelectorAll('.tab-btn');
    const tabContents = this.container.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        
        // Update active tab button
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding tab content
        tabContents.forEach(content => content.classList.remove('active'));
        this.container.querySelector(`#${tabId}-tab`).classList.add('active');
      });
    });
    
    // Color selection
    const colorOptions = this.container.querySelectorAll('.color-option');
    colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        const colorId = option.getAttribute('data-color-id');
        const imagePath = option.getAttribute('data-image');
        this.selectColor(colorId);
        
        colorOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        
        this.updateVehiclePreview(imagePath);
      });
    });
    
    // Wheel selection
    const wheelOptions = this.container.querySelectorAll('.wheel-option');
    wheelOptions.forEach(option => {
      option.addEventListener('click', () => {
        const wheelId = option.getAttribute('data-wheel-id');
        const imagePath = option.getAttribute('data-image');
        this.selectWheels(wheelId);
        
        wheelOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        
        // Only update preview if we're on the wheels tab
        if (this.container.querySelector('#wheels-tab').classList.contains('active')) {
          this.updateVehiclePreview(imagePath);
        }
      });
    });
    
    // Interior selection
    const interiorOptions = this.container.querySelectorAll('.interior-option');
    interiorOptions.forEach(option => {
      option.addEventListener('click', () => {
        const interiorId = option.getAttribute('data-interior-id');
        const imagePath = option.getAttribute('data-image');
        this.selectInterior(interiorId);
        
        interiorOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        
        // Only update preview if we're on the interior tab
        if (this.container.querySelector('#interior-tab').classList.contains('active')) {
          this.updateVehiclePreview(imagePath);
        }
      });
    });
    
    // Package selection
    const packageOptions = this.container.querySelectorAll('.package-option');
    packageOptions.forEach(option => {
      const toggleBtn = option.querySelector('.toggle-package-btn');
      toggleBtn.addEventListener('click', () => {
        const packageId = option.getAttribute('data-package-id');
        this.togglePackage(packageId);
        
        option.classList.toggle('active');
        toggleBtn.textContent = option.classList.contains('active') ? 'Remove' : 'Add';
        
        // If on the summary tab, update it
        if (this.container.querySelector('#summary-tab').classList.contains('active')) {
          this.updateSummaryTab();
        }
      });
    });
    
    // Navigation buttons
    const backBtn = this.container.querySelector('.back-btn');
    const nextBtn = this.container.querySelector('.next-btn');
    
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        const activeTabs = Array.from(tabButtons).findIndex(tab => tab.classList.contains('active'));
        
        if (activeTabs === 0) {
          // If on the first tab, go back to model selection
          this.render();
          this.attachEventListeners();
        } else {
          // Otherwise go to previous tab
          tabButtons[activeTabs - 1].click();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const activeTabs = Array.from(tabButtons).findIndex(tab => tab.classList.contains('active'));
        
        if (activeTabs < tabButtons.length - 1) {
          tabButtons[activeTabs + 1].click();
        }
      });
    }
    
    // Summary actions
    const saveConfigBtn = this.container.querySelector('.summary-btn.save-config');
    const testDriveBtn = this.container.querySelector('.summary-btn.test-drive');
    
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener('click', () => {
        this.saveConfiguration();
      });
    }
    
    if (testDriveBtn) {
      testDriveBtn.addEventListener('click', () => {
        this.requestTestDrive();
      });
    }
  }
  
  selectModel(modelId) {
    this.configuration.model = modelId;
    this.configuration.color = null;
    this.configuration.wheels = null;
    this.configuration.interior = null;
    this.configuration.packages = [];
    
    this.renderConfigurator();
  }
  
  selectColor(colorId) {
    this.configuration.color = colorId;
  }
  
  selectWheels(wheelId) {
    this.configuration.wheels = wheelId;
  }
  
  selectInterior(interiorId) {
    this.configuration.interior = interiorId;
  }
  
  togglePackage(packageId) {
    if (this.configuration.packages.includes(packageId)) {
      this.configuration.packages = this.configuration.packages.filter(id => id !== packageId);
    } else {
      this.configuration.packages.push(packageId);
    }
  }
  
  updateVehiclePreview(imagePath) {
    // Update the vehicle preview image
    if (imagePath) {
      const previewImage = this.container.querySelector('.vehicle-preview img');
      if (previewImage) {
        previewImage.src = imagePath;
      }
    }
  }
  
  updateSummaryTab() {
    const model = this.availableModels.find(m => m.id === this.configuration.model);
    if (!model) return;
    
    const summaryTab = this.container.querySelector('#summary-tab');
    
    summaryTab.innerHTML = `
      <h3>Your Configuration</h3>
      <div class="configuration-summary">
        <div class="summary-item">
          <span class="item-name">Base Price</span>
          <span class="item-value">$${model.basePrice.toLocaleString()}</span>
        </div>
        
        ${this.configuration.color ? `
          <div class="summary-item">
            <span class="item-name">Color: ${this.getColorName(model, this.configuration.color)}</span>
            <span class="item-value">+$${this.getColorPrice(model, this.configuration.color).toLocaleString()}</span>
          </div>
        ` : ''}
        
        ${this.configuration.wheels ? `
          <div class="summary-item">
            <span class="item-name">Wheels: ${this.getWheelName(model, this.configuration.wheels)}</span>
            <span class="item-value">+$${this.getWheelPrice(model, this.configuration.wheels).toLocaleString()}</span>
          </div>
        ` : ''}
        
        ${this.configuration.interior ? `
          <div class="summary-item">
            <span class="item-name">Interior: ${this.getInteriorName(model, this.configuration.interior)}</span>
            <span class="item-value">+$${this.getInteriorPrice(model, this.configuration.interior).toLocaleString()}</span>
          </div>
        ` : ''}
        
        ${this.configuration.packages.length > 0 ? `
          <div class="summary-item packages-summary">
            <span class="item-name">Packages</span>
            <span class="item-value"></span>
          </div>
          ${this.configuration.packages.map(pkgId => {
            const pkg = this.packages.find(p => p.id === pkgId);
            return `
              <div class="summary-item package-item">
                <span class="item-name">- ${pkg.name}</span>
                <span class="item-value">+$${pkg.price.toLocaleString()}</span>
              </div>
            `;
          }).join('')}
        ` : ''}
        
        <div class="summary-total">
          <span class="total-label">Total Price</span>
          <span class="total-value">$${this.calculateTotalPrice().toLocaleString()}</span>
        </div>
      </div>
      
      <div class="summary-actions">
        <button class="summary-btn save-config">Save Configuration</button>
        <button class="summary-btn test-drive">Request Test Drive</button>
      </div>
    `;
    
    // Reattach event listeners for the summary actions
    const saveConfigBtn = summaryTab.querySelector('.summary-btn.save-config');
    const testDriveBtn = summaryTab.querySelector('.summary-btn.test-drive');
    
    if (saveConfigBtn) {
      saveConfigBtn.addEventListener('click', () => {
        this.saveConfiguration();
      });
    }
    
    if (testDriveBtn) {
      testDriveBtn.addEventListener('click', () => {
        this.requestTestDrive();
      });
    }
  }
  
  saveConfiguration() {
    // In a real implementation, this would save to server or local storage
    console.log('Saving configuration:', this.configuration);
    alert('Your configuration has been saved!');
  }
  
  requestTestDrive() {
    console.log('Requesting test drive for configuration:', this.configuration);
    alert('Your test drive request has been submitted. A BMW representative will contact you shortly.');
  }
  
  calculateTotalPrice() {
    const model = this.availableModels.find(m => m.id === this.configuration.model);
    if (!model) return 0;
    
    let total = model.basePrice;
    
    // Add color price
    if (this.configuration.color) {
      total += this.getColorPrice(model, this.configuration.color);
    }
    
    // Add wheels price
    if (this.configuration.wheels) {
      total += this.getWheelPrice(model, this.configuration.wheels);
    }
    
    // Add interior price
    if (this.configuration.interior) {
      total += this.getInteriorPrice(model, this.configuration.interior);
    }
    
    // Add packages prices
    this.configuration.packages.forEach(pkgId => {
      const pkg = this.packages.find(p => p.id === pkgId);
      if (pkg) {
        total += pkg.price;
      }
    });
    
    return total;
  }
  
  getColorCode(colorId) {
    // Map color IDs to actual CSS color codes
    const colorMap = {
      'blue': '#0066B1',
      'white': '#f2f2f2',
      'black': '#222222',
      'grey': '#7D7D7D',
      'yellow': '#f0c000',
      'green': '#1c6d36'
    };
    
    return colorMap[colorId] || '#000000';
  }
  
  getColorName(model, colorId) {
    const color = model.colors.find(c => c.id === colorId);
    return color ? color.name : '';
  }
  
  getColorPrice(model, colorId) {
    const color = model.colors.find(c => c.id === colorId);
    return color ? color.price : 0;
  }
  
  getWheelName(model, wheelId) {
    const wheel = model.wheels.find(w => w.id === wheelId);
    return wheel ? wheel.name : '';
  }
  
  getWheelPrice(model, wheelId) {
    const wheel = model.wheels.find(w => w.id === wheelId);
    return wheel ? wheel.price : 0;
  }
  
  getInteriorName(model, interiorId) {
    const interior = model.interiors.find(i => i.id === interiorId);
    return interior ? interior.name : '';
  }
  
  getInteriorPrice(model, interiorId) {
    const interior = model.interiors.find(i => i.id === interiorId);
    return interior ? interior.price : 0;
  }
}

// Initialize the configurator when the page loads
document.addEventListener('DOMContentLoaded', function() {
  const configuratorContainer = document.getElementById('vehicle-configurator');
  if (configuratorContainer) {
    new BMWConfigurator('vehicle-configurator');
  }
}); 