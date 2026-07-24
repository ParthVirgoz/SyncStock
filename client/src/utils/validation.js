export function hasErrors(errors) {
  return Object.keys(errors).length > 0
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const OBJECT_ID_HEX_PATTERN = /^[a-f0-9]{24}$/i

export function validateLoginForm(form) {
  const errors = {}

  if (!form.email?.trim()) {
    errors.email = 'Email is required'
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = 'Invalid email address'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }

  return errors
}

export function validateCategoryForm(form) {
  const errors = {}

  if (!form.name?.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!form.typeId) {
    errors.typeId = 'Product type is required'
  } else if (!OBJECT_ID_HEX_PATTERN.test(form.typeId)) {
    errors.typeId = 'Invalid product type'
  }

  if (form.description && form.description.length > 500) {
    errors.description = 'Description must be less than 500 characters'
  }

  return errors
}

export function validateProductTypeForm(form) {
  const errors = {}

  if (!form.name?.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (form.name.trim().length > 50) {
    errors.name = 'Name must be less than 50 characters'
  }

  if (form.description && form.description.length > 255) {
    errors.description = 'Description must be less than 255 characters'
  }

  return errors
}

export function validateLocationForm(form) {
  const errors = {}

  if (!form.name?.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!form.type) {
    errors.type = 'Type is required'
  }

  const address = form.address || {}
  if (!address.line1?.trim()) errors.line1 = 'Address line is required'
  if (!address.city?.trim()) errors.city = 'City is required'
  if (!address.state?.trim()) errors.state = 'State is required'
  if (!address.country?.trim()) errors.country = 'Country is required'
  if (!address.pincode?.trim()) errors.pincode = 'Pincode is required'

  return errors
}

export function validateProductForm(form) {
  const errors = {}

  if (!form.name?.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!form.unit) {
    errors.unit = 'Unit is required'
  }

  if (!form.sku?.trim()) {
    errors.sku = 'SKU is required'
  }

  if (!form.categoryId) {
    errors.categoryId = 'Category is required'
  }

  if (form.minStockLevel === '' || Number(form.minStockLevel) < 0) {
    errors.minStockLevel = 'Minimum stock level must be 0 or greater'
  }

  return errors
}

export function validateSupplierForm(form) {
  const errors = {}

  if (!form.name?.trim() || form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  }

  if (!/^[0-9]{10}$/.test(form.contactNumber || '')) {
    errors.contactNumber = 'Contact number must be exactly 10 digits'
  }

  if (!form.address?.trim() || form.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters'
  }

  return errors
}

export function validateInventoryAdjustForm(form) {
  const errors = {}

  if (!form.productId) {
    errors.productId = 'Product is required'
  }

  if (!form.locationId) {
    errors.locationId = 'Location is required'
  }

  if (form.quantity === '' || form.quantity == null || Number.isNaN(Number(form.quantity))) {
    errors.quantity = 'Quantity is required'
  } else if (Number(form.quantity) === 0) {
    errors.quantity = 'Quantity cannot be zero'
  }

  return errors
}

export function validateBomForm(form) {
  const errors = {}

  if (!form.productId) {
    errors.productId = 'Finished product is required'
  }

  if (!form.materials?.length) {
    errors.materials = 'At least one material is required'
    return errors
  }

  form.materials.forEach((material, index) => {
    if (!material.productId) {
      errors[`materials.${index}.productId`] = 'Material product is required'
    }
    if (
      material.quantity === '' ||
      material.quantity == null ||
      Number.isNaN(Number(material.quantity)) ||
      Number(material.quantity) < 0
    ) {
      errors[`materials.${index}.quantity`] = 'Valid quantity is required'
    }
  })

  return errors
}

export function validateProductionCreateForm(form) {
  const errors = {}

  if (!form.productId) {
    errors.productId = 'Product is required'
  }

  if (
    form.quantityToProduce === '' ||
    form.quantityToProduce == null ||
    Number.isNaN(Number(form.quantityToProduce)) ||
    Number(form.quantityToProduce) < 0
  ) {
    errors.quantityToProduce = 'Quantity to produce is required'
  }

  ;(form.materialsUsed || []).forEach((material, index) => {
    if (!material.productId) {
      errors[`materialsUsed.${index}.productId`] = 'Material product is required'
    }
    if (!material.locationId) {
      errors[`materialsUsed.${index}.locationId`] = 'Material location is required'
    }
    if (
      material.quantity === '' ||
      material.quantity == null ||
      Number.isNaN(Number(material.quantity)) ||
      Number(material.quantity) < 0
    ) {
      errors[`materialsUsed.${index}.quantity`] = 'Valid quantity is required'
    }
  })

  return errors
}

export function validateProductionCompleteForm(form) {
  const errors = {}

  if (!form.locationId) {
    errors.locationId = 'Output location is required'
  }

  if (
    form.wastage !== '' &&
    form.wastage != null &&
    (Number.isNaN(Number(form.wastage)) || Number(form.wastage) < 0)
  ) {
    errors.wastage = 'Wastage cannot be negative'
  }

  ;(form.materialsUsed || []).forEach((material, index) => {
    if (!material.productId) {
      errors[`materialsUsed.${index}.productId`] = 'Material product is required'
    }
    if (!material.locationId) {
      errors[`materialsUsed.${index}.locationId`] = 'Material location is required'
    }
    if (
      material.quantity === '' ||
      material.quantity == null ||
      Number.isNaN(Number(material.quantity)) ||
      Number(material.quantity) < 0
    ) {
      errors[`materialsUsed.${index}.quantity`] = 'Valid quantity is required'
    }
  })

  return errors
}

export function validatePurchaseOrderForm(form) {
  const errors = {}

  if (!form.supplierId) {
    errors.supplierId = 'Supplier is required'
  }

  if (!form.items?.length) {
    errors.items = 'At least one line item is required'
    return errors
  }

  form.items.forEach((item, index) => {
    if (!item.productId) {
      errors[`items.${index}.productId`] = 'Product is required'
    }
    if (
      item.quantity === '' ||
      item.quantity == null ||
      Number.isNaN(Number(item.quantity)) ||
      Number(item.quantity) < 1
    ) {
      errors[`items.${index}.quantity`] = 'Quantity must be at least 1'
    }
    if (
      item.price === '' ||
      item.price == null ||
      Number.isNaN(Number(item.price)) ||
      Number(item.price) < 0
    ) {
      errors[`items.${index}.price`] = 'Valid price is required'
    }
  })

  return errors
}

export function validateReceivePurchaseOrderForm(form) {
  const errors = {}

  if (!form.locationId) {
    errors.locationId = 'Receiving location is required'
  }

  return errors
}

export function validateSaleOrderForm(form) {
  const errors = {}

  if (!form.customerName?.trim() || form.customerName.trim().length < 2) {
    errors.customerName = 'Customer name must be at least 2 characters'
  }

  if (!form.items?.length) {
    errors.items = 'At least one line item is required'
    return errors
  }

  form.items.forEach((item, index) => {
    if (!item.productId) {
      errors[`items.${index}.productId`] = 'Product is required'
    }
    if (!item.locationId) {
      errors[`items.${index}.locationId`] = 'Location is required'
    }
    if (
      item.quantity === '' ||
      item.quantity == null ||
      Number.isNaN(Number(item.quantity)) ||
      Number(item.quantity) < 0
    ) {
      errors[`items.${index}.quantity`] = 'Valid quantity is required'
    }
    if (
      item.price === '' ||
      item.price == null ||
      Number.isNaN(Number(item.price)) ||
      Number(item.price) < 0
    ) {
      errors[`items.${index}.price`] = 'Valid price is required'
    }
  })

  return errors
}

export function filterByActiveStatus(items, statusFilter) {
  if (statusFilter === 'active') {
    return items.filter((item) => item.isActive !== false)
  }

  if (statusFilter === 'inactive') {
    return items.filter((item) => item.isActive === false)
  }

  return items
}
