import { Composition } from 'remotion';
// @ts-expect-error Menu is authored as JSX in this project.
import { Menu } from './Menu';
// @ts-expect-error FuneralSlideshow is authored as JSX in this project.
import { FuneralSlideshow } from './FuneralSlideshow';
// @ts-expect-error WeddingSlideshowController is authored as JSX in this project.
import { WeddingSlideshowController } from './wedding/WeddingSlideshowController';
import { z } from 'zod';

const SignageSchema = z.object({
  isLocked: z.boolean().default(false),
  headerText: z.string().default("TONY'S BAR"),
  headerSubtext: z.string().default('EATS & DRINKS'),
  headerTop: z.number().default(60),
  headerLeft: z.number().default(460),
  headerWidth: z.number().default(600),
  headerScale: z.number().default(1),
  imageTop: z.number().default(450),
  imageLeft: z.number().default(580),
  imageWidth: z.number().default(380),
  imageHeight: z.number().default(460),
  foodHeading: z.string().default('EATS'),
  foodTop: z.number().default(260),
  foodLeft: z.number().default(80),
  foodWidth: z.number().default(600),
  foodSize: z.number().default(26),
  cocktailsHeading: z.string().default('DRINKS'),
  cocktailsTop: z.number().default(260),
  cocktailsLeft: z.number().default(840),
  cocktailsWidth: z.number().default(610),
  cocktailsSize: z.number().default(26),
  
  cocktailItems: z.array(z.object({ name: z.string(), price: z.string(), desc: z.string() })),
  foodItems: z.array(z.object({ name: z.string(), price: z.string() }))
});

const MemorialPhotoSchema = z.object({
  image_url: z.string().default(''),
  caption: z.string().default(''),
  sender_name: z.string().default(''),
  message_text: z.string().default(''),
});

const FuneralSlideshowSchema = z.object({
  funeralHomeName: z.string().default('Evergreen Funeral Home'),
  lovedOneName: z.string().default('James Williams'),
  // 🔒 SECURITY FIREWALL: Removed 'smith-wedding-2026' fallback default parameter
  liveEventId: z.string().default('generic-memorial-stream'),
  cloudProvider: z.enum(['none', 'supabase', 'firebase']).default('firebase'),
  enableLiveData: z.boolean().default(true),
  supabaseRestUrl: z.string().default(''),
  supabaseAnonKey: z.string().default(''),
  firebaseRestUrl: z.string().default(''),
  pollIntervalMs: z.number().default(7000),
  earlyYearsPhotos: z.array(MemorialPhotoSchema).default([]),
  familyPhotos: z.array(MemorialPhotoSchema).default([]),
  legacyPhotos: z.array(MemorialPhotoSchema).default([]),
  liveTributesSeed: z.array(MemorialPhotoSchema).default([]),
});

const WeddingSlideshowSchema = z.object({
  coupleNames: z.string().default('Sarah & David'),
  liveEventId: z.string().default('smith-wedding-2026'),
  enableLiveData: z.boolean().default(true),
  firebaseRestUrl: z.string().default(''),
});

export const Root = () => {
  return (
    <>
      <Composition
        id="TonysBarMenu"
        component={Menu}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={SignageSchema}
        defaultProps={{
          isLocked: false,
          headerText: "TONY'S BAR",
          headerSubtext: "EATS & DRINKS",
          headerTop: 82,
          headerLeft: 460,
          headerWidth: 600,
          headerScale: 1,
          imageTop: 56,
          imageLeft: 1238,
          imageWidth: 633,
          imageHeight: 421,
          foodHeading: "EATS",
          foodTop: 366,
          foodLeft: 92,
          foodWidth: 600,
          foodSize: 41,
          cocktailsHeading: "DRINKS",
          cocktailsTop: 546,
          cocktailsLeft: 1278,
          cocktailsWidth: 509,
          cocktailsSize: 20,
          cocktailItems: [
            { name: "MULE", price: "$10", desc: "Tito's or Jameson, ginger beer, lime" },
            { name: "PEACH LEMONADE", price: "$5", desc: "Tito's or Crown Royal Peach, lemonade" },
            { name: "THE COLADA", price: "$10", desc: "Pineapple vodka, coco real, juice" },
            { name: "LAVENDER MARTINI", price: "$12", desc: "Tito's vodka, syrup, fresh lavender" },
          ],
          foodItems: [
            { name: "STUFFED JALAPEÑOS", price: "$10" },
            { name: "BAR SLIDERS", price: "$12" },
            { name: "LOADED FRIES", price: "$10" },
            { name: "BUFFALO CAULIFLOWER", price: "$13" },
          ],
        }}
      />

      <Composition
        id="FuneralHomeSlideshow"
        component={FuneralSlideshow}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
        schema={FuneralSlideshowSchema}
        // ⚡ DYNAMIC UPDATE: Connected directly to Firebase Cloud Pipelines instantly
        defaultProps={{
          funeralHomeName: "Evergreen Funeral Home",
          lovedOneName: "James Williams",
          liveEventId: "Tom-Memorial", 
          cloudProvider: "firebase",   
          enableLiveData: true,        
          supabaseRestUrl: "",
          supabaseAnonKey: "",
          firebaseRestUrl: "",
          pollIntervalMs: 7000,
          earlyYearsPhotos: [
            { image_url: "", caption: "Baby picture or childhood portrait", sender_name: "", message_text: "" },
            { image_url: "", caption: "School days and early family memories", sender_name: "", message_text: "" },
          ],
          familyPhotos: [
            { image_url: "", caption: "Marriage, children, and milestones", sender_name: "", message_text: "" },
            { image_url: "", caption: "Holiday gatherings and family traditions", sender_name: "", message_text: "" },
          ],
          legacyPhotos: [
            { image_url: "", caption: "Grandchildren, friends, and community impact", sender_name: "", message_text: "" },
          ],
          liveTributesSeed: [
            { image_url: "", caption: "Awaiting live guest tribute", sender_name: "Guestbook", message_text: "Your memories will appear here." },
          ],
        }}
      />

      <Composition
        id="WeddingLiveReelSlideshow"
        component={WeddingSlideshowController}
        durationInFrames={3600}
        fps={30}
        width={1920}
        height={1080}
        schema={WeddingSlideshowSchema}
        defaultProps={{
          coupleNames: "Sarah & David",
          liveEventId: "smith-wedding-2026",
          enableLiveData: true,
          firebaseRestUrl: "",
        }}
      />
    </>
  );
};