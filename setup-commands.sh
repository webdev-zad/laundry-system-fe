# Create project directory
mkdir laundry-system
cd laundry-system

# Initialize package.json
npm init -y

# Create client and server directories
mkdir -p client server

# Initialize Next.js app in client directory
cd client
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install shadcn/ui and dependencies
npm install @radix-ui/react-slot @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-toast lucide-react class-variance-authority clsx tailwind-merge

# Setup server
cd ../server
npm init -y
npm install express cors dotenv jsonwebtoken bcrypt mongoose prisma @prisma/client
npm install -D typescript ts-node @types/express @types/cors @types/node @types/jsonwebtoken @types/bcrypt

# Initialize TypeScript configuration
npx tsc --init

# Create Prisma schema directory
mkdir -p prisma 