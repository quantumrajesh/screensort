# Contributing to ScreenSort 🤝

Thank you for your interest in contributing to ScreenSort! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git
- Supabase account
- OpenRouter API key (for AI features)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/screensort.git
   cd screensort
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Fill in your Supabase and OpenRouter credentials
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 How to Contribute

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title** describing the issue
- **Steps to reproduce** the behavior
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (browser, OS, etc.)
- **Console errors** if any

### 💡 Suggesting Features

Feature suggestions are welcome! Please:

- Check if the feature already exists or is planned
- Provide a clear description of the feature
- Explain the use case and benefits
- Consider implementation complexity

### 🔧 Code Contributions

#### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

#### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** following our coding standards
3. **Test thoroughly** on different devices/browsers
4. **Update documentation** if needed
5. **Commit with clear messages**
6. **Push and create a Pull Request**

#### Code Style Guidelines

**TypeScript/React**
- Use TypeScript for all new code
- Follow existing component patterns
- Use functional components with hooks
- Implement proper error handling
- Add JSDoc comments for complex functions

**CSS/Styling**
- Use Tailwind CSS classes
- Follow responsive design principles
- Maintain consistent spacing (8px grid)
- Use semantic color names
- Test on mobile devices

**File Organization**
- Keep components under 300 lines
- Use clear, descriptive file names
- Group related functionality
- Maintain proper import/export structure

## 🧪 Testing

### Manual Testing Checklist

**Upload Functionality**
- [ ] Drag and drop works
- [ ] Click to upload works
- [ ] Multiple file upload
- [ ] Progress indicators
- [ ] Error handling

**AI Analysis**
- [ ] Object detection works
- [ ] Color analysis works
- [ ] Text extraction works
- [ ] Gemini analysis works
- [ ] Fallback handling

**Search Functionality**
- [ ] Text search works
- [ ] Object search works
- [ ] Color search works
- [ ] Combined search works
- [ ] No results handling

**Responsive Design**
- [ ] Mobile (320px+)
- [ ] Tablet (768px+)
- [ ] Desktop (1024px+)
- [ ] Large screens (1440px+)

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🏗️ Architecture Guidelines

### Component Structure

```typescript
// Component template
interface ComponentProps {
  // Define props with clear types
}

export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks at the top
  const [state, setState] = useState();
  
  // Event handlers
  const handleEvent = () => {
    // Implementation
  };
  
  // Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  
  // Main render
  return (
    <div className="responsive-classes">
      {/* Content */}
    </div>
  );
}
```

### State Management

- Use React hooks for local state
- Use custom hooks for shared logic
- Keep state as close to usage as possible
- Use proper TypeScript types

### Error Handling

- Implement try-catch blocks for async operations
- Provide user-friendly error messages
- Log errors for debugging
- Graceful degradation for AI features

## 🎨 Design Guidelines

### Visual Design

- Follow the existing design system
- Use consistent spacing (8px grid)
- Maintain proper contrast ratios
- Use semantic colors
- Implement smooth transitions

### User Experience

- Provide clear feedback for user actions
- Implement loading states
- Handle edge cases gracefully
- Ensure accessibility compliance
- Test with real user scenarios

## 🔍 AI Integration Guidelines

### Object Detection (COCO-SSD)

- Handle model loading states
- Implement confidence thresholds
- Provide fallback for detection failures
- Log detection results for debugging

### Gemini Vision API

- Handle API rate limits gracefully
- Implement proper error handling
- Provide fallback analysis
- Respect API usage guidelines

### OCR (Tesseract.js)

- Handle large image files
- Implement progress indicators
- Provide text extraction fallbacks
- Optimize for performance

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Document component props with TypeScript
- Include usage examples
- Explain AI analysis logic

### README Updates

- Keep installation instructions current
- Update feature lists
- Maintain troubleshooting section
- Include new configuration options

## 🚀 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Build succeeds
- [ ] Deployment tested

## 🤔 Questions?

- **General Questions**: Use GitHub Discussions
- **Bug Reports**: Create an issue
- **Feature Requests**: Create an issue with feature template
- **Security Issues**: Email maintainers directly

## 🙏 Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Credited in the application

Thank you for helping make ScreenSort better! 🎉