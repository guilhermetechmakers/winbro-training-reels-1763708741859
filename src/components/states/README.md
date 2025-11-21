# Loading, Success, and Empty State Components

This directory contains reusable components for handling loading, success, and empty states throughout the application.

## Components

### LoadingState

Displays skeleton loaders for different content types while data is being fetched.

**Variants:**
- `list` - Vertical list of items
- `grid` - Grid of cards
- `thumbnail` - Grid of thumbnail cards (with image placeholders)
- `table` - Table rows with header
- `card` - Single card

**Example:**
```tsx
import { LoadingState } from "@/components/states";

// List variant
{isLoading && <LoadingState variant="list" count={5} />}

// Grid variant
{isLoading && <LoadingState variant="grid" count={6} columns={3} />}

// Thumbnail variant (for video/image grids)
{isLoading && <LoadingState variant="thumbnail" count={8} />}
```

### EmptyState

Displays an empty state with icon, title, description, and optional action buttons.

**Example:**
```tsx
import { EmptyState } from "@/components/states";
import { Video } from "lucide-react";

<EmptyState
  icon={Video}
  title="No reels found"
  description="Get started by uploading your first training reel."
  action={{
    label: "Upload Reel",
    href: "/upload", // or onClick: () => handleUpload()
  }}
  secondaryAction={{
    label: "Browse Library",
    href: "/library",
    variant: "outline",
  }}
/>
```

**Props:**
- `icon` - Lucide icon component
- `title` - Main heading (required)
- `description` - Optional description text
- `action` - Primary action button (can use `href` or `onClick`)
- `secondaryAction` - Secondary action button
- `illustration` - Custom React node for illustration
- `size` - "sm" | "md" | "lg" (default: "md")
- `className` - Additional CSS classes

### SuccessModal

Modal dialog for confirming successful actions.

**Example:**
```tsx
import { SuccessModal } from "@/components/states";
import { useState } from "react";

const [showSuccess, setShowSuccess] = useState(false);

<SuccessModal
  open={showSuccess}
  onClose={() => setShowSuccess(false)}
  title="Reel uploaded successfully!"
  description="Your reel has been submitted for moderation and will appear in the library once approved."
  primaryAction={{
    label: "View Reel",
    onClick: () => {
      navigate(`/reel/${reelId}`);
      setShowSuccess(false);
    },
  }}
  secondaryAction={{
    label: "Upload Another",
    onClick: () => {
      navigate("/upload");
      setShowSuccess(false);
    },
    variant: "outline",
  }}
/>
```

## Toast Notifications

For quick success/error feedback, use the toast utility:

```tsx
import { showToast } from "@/lib/toast";

// Success
showToast.success("Reel uploaded successfully!");

// Error
showToast.error("Upload failed", "Please try again or contact support.");

// Loading (returns ID for dismissal)
const toastId = showToast.loading("Uploading...");
// Later...
showToast.dismiss(toastId);
showToast.success("Upload complete!");

// Promise toast
showToast.promise(
  uploadReel(file),
  {
    loading: "Uploading reel...",
    success: "Reel uploaded successfully!",
    error: (err) => `Upload failed: ${err.message}`,
  }
);
```

## Usage Patterns

### Complete Data Fetching Pattern

```tsx
import { useQuery } from "@tanstack/react-query";
import { LoadingState, EmptyState } from "@/components/states";
import { Video } from "lucide-react";

const { data: reels, isLoading } = useQuery({
  queryKey: ["reels"],
  queryFn: () => api.get<Reel[]>("/reels"),
});

if (isLoading) {
  return <LoadingState variant="thumbnail" count={8} />;
}

if (!reels || reels.length === 0) {
  return (
    <EmptyState
      icon={Video}
      title="No reels found"
      description="Upload your first reel to get started."
      action={{ label: "Upload Reel", href: "/upload" }}
    />
  );
}

return (
  <div className="grid gap-4">
    {reels.map((reel) => (
      <ReelCard key={reel.id} reel={reel} />
    ))}
  </div>
);
```

### Form Submission with Success Modal

```tsx
import { useState } from "react";
import { SuccessModal } from "@/components/states";
import { showToast } from "@/lib/toast";

const [showSuccess, setShowSuccess] = useState(false);

const handleSubmit = async (data) => {
  try {
    await api.post("/reels", data);
    setShowSuccess(true);
  } catch (error) {
    showToast.error("Submission failed", error.message);
  }
};

return (
  <>
    <form onSubmit={handleSubmit}>...</form>
    
    <SuccessModal
      open={showSuccess}
      onClose={() => setShowSuccess(false)}
      title="Reel submitted successfully!"
      description="Your reel is now pending moderation."
      primaryAction={{
        label: "View Dashboard",
        onClick: () => navigate("/dashboard"),
      }}
    />
  </>
);
```

## Design System Compliance

All components follow the design system:
- Colors: Uses design system color tokens
- Typography: Follows Inter font hierarchy
- Spacing: Uses consistent spacing scale
- Animations: Fade-in and scale animations with proper timing
- Accessibility: Proper ARIA labels and keyboard navigation
