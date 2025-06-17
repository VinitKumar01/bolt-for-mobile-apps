import Prompt from "@/components/Prompt";
import TemplateButtons from "@/components/TemplateButtons";

export default function Home() {
  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto pt-32">
        <div className="text-2xl font-bold text-center">
          What do you want to build?
        </div>
        <div className="text-sm text-muted-foreground text-center p-2">
          Prompt, click and watch your app come to life?
        </div>
        <div className="pt-4">
          <Prompt />
        </div>
      </div>
      <div className="max-w-2xl mx-auto pt-4">
        <TemplateButtons />
      </div>
    </div>
  );
}
