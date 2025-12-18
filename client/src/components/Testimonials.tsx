import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star, Quote } from "lucide-react";
import testimonial1 from "@assets/generated_images/Customer_testimonial_photo_1_4bdee3e3.png";
import testimonial2 from "@assets/generated_images/Customer_testimonial_photo_2_4cea6eb3.png";
import testimonial3 from "@assets/generated_images/Customer_testimonial_photo_3_b9f608d1.png";

const testimonials = [
  {
    image: testimonial1,
    quote: "SFS-SocialPowerhouse has transformed how we manage our social media. The AI content generation saves us hours every week and the quality is incredible.",
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    rating: 5
  },
  {
    image: testimonial2,
    quote: "The analytics dashboard gives us insights we never had before. We've increased engagement by 300% in just two months. Absolute game-changer!",
    name: "Michael Chen",
    role: "Founder & CEO",
    company: "StartupHub",
    rating: 5
  },
  {
    image: testimonial3,
    quote: "Best social media tool I've used. The AI suggestions are spot-on and the scheduling feature is incredibly intuitive. Highly recommend for any business.",
    name: "Emma Rodriguez",
    role: "Social Media Manager",
    company: "BrandWorks",
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 lg:py-32 bg-sfs-black relative overflow-hidden" data-testid="section-testimonials">
      <div className="absolute inset-0 circuit-bg opacity-20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="text-testimonials-heading">
            Loved by Marketers Worldwide
          </h2>
          <p className="text-lg text-sfs-beige/70 max-w-2xl mx-auto" data-testid="text-testimonials-subheading">
            See what our customers have to say about their experience with SFS Social PowerHouse
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="glass-card p-6 relative group hover:scale-[1.02] transition-transform duration-300"
              data-testid={`card-testimonial-${index}`}
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-sfs-gold/20" />
              
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-sfs-gold text-sfs-gold" data-testid={`star-${index}-${i}`} />
                ))}
              </div>
              
              <p className="text-sfs-beige/90 mb-6 leading-relaxed text-sm" data-testid={`text-testimonial-quote-${index}`}>
                "{testimonial.quote}"
              </p>
              
              <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                <Avatar className="w-10 h-10 border-2 border-sfs-gold/30">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback className="bg-sfs-gold/20 text-sfs-gold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white text-sm" data-testid={`text-testimonial-name-${index}`}>
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-sfs-beige/60" data-testid={`text-testimonial-role-${index}`}>
                    {testimonial.role}, {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
