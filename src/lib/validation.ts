// Validation utility functions

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email) return "Email is required";
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  if (email.length > 254) {
    return "Email is too long (maximum 254 characters)";
  }
  
  return null;
};

// Password validation
export const validatePassword = (password: string, isRegistration = false): string | null => {
  if (!password) return "Password is required";
  
  if (isRegistration) {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    
    if (password.length > 128) {
      return "Password is too long (maximum 128 characters)";
    }
    
    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
    }
  }
  
  return null;
};

// Name validation
export const validateName = (name: string): string | null => {
  if (!name) return "Name is required";
  
  if (name.trim().length < 2) {
    return "Name must be at least 2 characters long";
  }
  
  if (name.length > 50) {
    return "Name is too long (maximum 50 characters)";
  }
  
  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(name)) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }
  
  return null;
};

// Title validation
export const validateTitle = (title: string): string | null => {
  if (!title) return "Title is required";
  
  if (title.trim().length < 3) {
    return "Title must be at least 3 characters long";
  }
  
  if (title.length > 200) {
    return "Title is too long (maximum 200 characters)";
  }
  
  return null;
};

// Content validation
export const validateContent = (content: string): string | null => {
  if (!content) return "Content is required";
  
  if (content.trim().length < 10) {
    return "Content must be at least 10 characters long";
  }
  
  if (content.length > 50000) {
    return "Content is too long (maximum 50,000 characters)";
  }
  
  return null;
};

// Tags validation
export const validateTags = (tags: string): string | null => {
  if (!tags) return null; // Tags are optional
  
  const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  
  if (tagArray.length > 10) {
    return "Maximum 10 tags allowed";
  }
  
  for (const tag of tagArray) {
    if (tag.length < 2) {
      return "Each tag must be at least 2 characters long";
    }
    
    if (tag.length > 20) {
      return "Each tag must be no more than 20 characters long";
    }
    
    // Check for valid tag characters (letters, numbers, hyphens, underscores)
    const tagRegex = /^[a-zA-Z0-9\-_]+$/;
    if (!tagRegex.test(tag)) {
      return "Tags can only contain letters, numbers, hyphens, and underscores";
    }
  }
  
  return null;
};

// Role validation
export const validateRole = (role: string): string | null => {
  if (!role) return "Role is required";
  
  const validRoles = ['user', 'admin'];
  if (!validRoles.includes(role)) {
    return "Invalid role selected";
  }
  
  return null;
};

// Status validation
export const validateStatus = (status: string): string | null => {
  if (!status) return "Status is required";
  
  const validStatuses = ['draft', 'published'];
  if (!validStatuses.includes(status)) {
    return "Invalid status selected";
  }
  
  return null;
};

// Login form validation
export const validateLoginForm = (data: { email: string; password: string }): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push({ field: 'email', message: emailError });
  
  const passwordError = validatePassword(data.password);
  if (passwordError) errors.push({ field: 'password', message: passwordError });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Register form validation
export const validateRegisterForm = (data: { name: string; email: string; password: string }): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const nameError = validateName(data.name);
  if (nameError) errors.push({ field: 'name', message: nameError });
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push({ field: 'email', message: emailError });
  
  const passwordError = validatePassword(data.password, true);
  if (passwordError) errors.push({ field: 'password', message: passwordError });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Blog form validation
export const validateBlogForm = (data: { title: string; content: string; status: string; tags: string }): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const titleError = validateTitle(data.title);
  if (titleError) errors.push({ field: 'title', message: titleError });
  
  const contentError = validateContent(data.content);
  if (contentError) errors.push({ field: 'content', message: contentError });
  
  const statusError = validateStatus(data.status); // Use proper status validation
  if (statusError) errors.push({ field: 'status', message: statusError });
  
  const tagsError = validateTags(data.tags);
  if (tagsError) errors.push({ field: 'tags', message: tagsError });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// User form validation (for admin)
export const validateUserForm = (data: { name: string; email: string; password?: string; role: string }): ValidationResult => {
  const errors: ValidationError[] = [];
  
  const nameError = validateName(data.name);
  if (nameError) errors.push({ field: 'name', message: nameError });
  
  const emailError = validateEmail(data.email);
  if (emailError) errors.push({ field: 'email', message: emailError });
  
  // Password is required only for new users
  if (data.password !== undefined) {
    const passwordError = validatePassword(data.password, true);
    if (passwordError) errors.push({ field: 'password', message: passwordError });
  }
  
  const roleError = validateRole(data.role);
  if (roleError) errors.push({ field: 'role', message: roleError });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Comment validation
export const validateComment = (content: string): string | null => {
  if (!content) return "Comment is required";
  
  if (content.trim().length < 1) {
    return "Comment cannot be empty";
  }
  
  if (content.length > 1000) {
    return "Comment is too long (maximum 1,000 characters)";
  }
  
  return null;
};
