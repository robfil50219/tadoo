# Tadoo - Next.js Migration Guide

## What's Changed

This branch contains a full migration of Tadoo from Angular to Next.js 14 with React.

### Key Improvements

- **Simpler routing**: File-based routing instead of Angular Router
- **Better performance**: Built-in optimizations and SSR support
- **Modern React**: Hooks-based components instead of Angular decorators
- **Zustand state management**: Lightweight alternative to RxJS/BehaviorSubject
- **Same styling**: SCSS support maintained
- **Firebase compatible**: Existing Firebase integration preserved

## Getting Started

### Prerequisites

- Node.js 18+ (required for Next.js 14)
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables (optional for demo mode)
cp .env.example .env.local
# Edit .env.local with your Firebase credentials if using Firebase

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
tadoo/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main app page (replaces app.component.ts)
│   ├── globals.scss         # Global styles
│   └── page.scss            # Page-specific styles
├── components/
│   ├── Navigation.tsx       # Navigation sidebar
│   ├── AuthModal.tsx        # Authentication modal
│   └── views/               # View components (replaces todo-list/)
│       ├── Dashboard.tsx
│       ├── TasksList.tsx
│       ├── Calendar.tsx
│       ├── Family.tsx
│       ├── Chat.tsx
│       ├── Location.tsx
│       └── Settings.tsx
├── lib/
│   ├── config/
│   │   └── firebase.ts      # Firebase configuration
│   ├── store/
│   │   └── todoStore.ts     # Zustand store (replaces TodoService)
│   └── hooks/
│       ├── useAuth.ts       # Auth hook (replaces AuthService)
│       └── useLanguage.ts   # Language hook (replaces LanguageService)
├── public/                  # Static assets
├── package.json
├── tsconfig.json
├── next.config.js
└── .env.example
```

## Migration Mapping

### Angular → Next.js

| Angular | Next.js |
|---------|----------|
| `app.component.ts` | `app/page.tsx` |
| `app.component.html` | JSX in `app/page.tsx` |
| `app.component.scss` | `app/page.scss` |
| `TodoService` | `lib/store/todoStore.ts` (Zustand) |
| `AuthService` | `lib/hooks/useAuth.ts` |
| `LanguageService` | `lib/hooks/useLanguage.ts` |
| `@Component` decorator | React functional components |
| `ngOnInit` | `useEffect` hook |
| `@Input/@Output` | Component props |
| RxJS Observable | Zustand store subscription |

## Key Differences

### State Management

**Before (Angular + RxJS):**
```typescript
@Injectable()
export class TodoService {
  private stateSubject = new BehaviorSubject<FamilyState>(initialState);
  public state$: Observable<FamilyState> = this.stateSubject.asObservable();
}
```

**After (Next.js + Zustand):**
```typescript
export const useTodoStore = create<TodoStoreState>((set, get) => ({
  state: initialState,
  addTodo: (title) => set({ state: { ...get().state, todos: [...] } }),
}))
```

### Component Structure

**Before (Angular):**
```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements OnInit {
  ngOnInit() { }
}
```

**After (Next.js + React):**
```typescript
'use client';

export default function App() {
  useEffect(() => {}, []);
  return <div>{/* JSX */}</div>;
}
```

## Demo vs. Firebase Mode

### Demo Mode (Default)

Runs entirely in-browser with sample data:
- No external dependencies
- Data stored in localStorage
- Instant startup
- Perfect for testing and development

```bash
npm run dev
# Visit http://localhost:3000 - ready to use immediately
```

### Firebase Mode (Optional)

Enable cloud sync and authentication:
1. Set `NEXT_PUBLIC_FIREBASE_*` environment variables in `.env.local`
2. The app automatically switches to Firebase mode
3. Requires Firebase project setup

## Next Steps

1. **Test locally**: Run `npm run dev` and verify all features work
2. **Firebase Authentication**: Integrate Firebase Auth in `lib/hooks/useAuth.ts`
3. **Firestore Sync**: Set up real-time sync in `lib/store/todoStore.ts`
4. **Calendar Integration**: Implement FullCalendar in `components/views/Calendar.tsx`
5. **Location Features**: Add location tracking in `components/views/Location.tsx`
6. **Chat System**: Implement family chat in `components/views/Chat.tsx`
7. **Deploy**: Choose your platform (Vercel recommended)

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

### Other Platforms

- **Netlify**: `vercel deploy --prod --prebuilt` or use Netlify CLI
- **Docker**: Create a Dockerfile for containerized deployment
- **Firebase Hosting**: Use `firebase deploy` after building

## Troubleshooting

### "Module not found" errors

Make sure the `@/*` path alias in `tsconfig.json` is set correctly.

### Firebase initialization fails

Check that all `NEXT_PUBLIC_FIREBASE_*` environment variables are set in `.env.local`. The app will work in demo mode without them.

### Hot reload not working

Restart the dev server: `npm run dev`

### Port 3000 already in use

```bash
npm run dev -- -p 3001
```

## Performance Tips

- Use `'use client'` at the top of components that need interactivity
- Leverage Next.js Image optimization for assets
- Consider code splitting with dynamic imports
- Monitor bundle size with `npm run build` and check `.next/` output

## Testing

To set up Jest and React Testing Library:

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
npm run test
```

## Quick Reference

### Common Commands

```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm start           # Start production server
npm run lint        # Run ESLint
npm run type-check  # Check TypeScript
```

### Environment Variables

Optional (demo mode works without these):
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

## Support

- Next.js documentation: https://nextjs.org/docs
- React hooks: https://react.dev/reference/react/hooks
- Zustand docs: https://github.com/pmndrs/zustand
- Firebase docs: https://firebase.google.com/docs
