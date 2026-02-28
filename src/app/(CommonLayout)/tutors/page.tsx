import { getAllTutors } from "@/services/tutors";
import TutorCard from "@/components/TutorCard";
import TutorFilters from "@/components/TutorFilters";
import { TutorType } from "@/types/tutor";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function TutorsPage(props: Props) {
  const searchParams = await props.searchParams;

  const filters = {
    category: typeof searchParams.category === 'string' ? searchParams.category : undefined,
    price: typeof searchParams.price === 'string' ? searchParams.price : undefined,
    rating: typeof searchParams.rating === 'string' ? searchParams.rating : undefined,
  };

  const response = await getAllTutors(filters);
  let tutors: TutorType[] = [];

  if (response && response.data && Array.isArray(response.data)) {
    tutors = response.data;
  } else if (response && Array.isArray(response)) {
    tutors = response;
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-24 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading">Explore Expert Tutors</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Find the perfect tutor to help you master new skills and accelerate your learning journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          <div className="lg:col-span-1 lg:sticky lg:top-24 z-10">
            <TutorFilters />
          </div>

          <div className="lg:col-span-3">
            {tutors.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {tutors.map((tutor) => (
                  <div key={tutor.id} className="h-full">
                    <TutorCard tutor={tutor} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-border shadow-sm">
                <h2 className="text-2xl font-bold font-heading mb-2">No Tutors Found</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  We could not find any tutors matching your current filters. Try changing or clearing your filters to see more results.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
