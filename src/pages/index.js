import { useEffect, useState } from "react";
import { collection, query, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function ResumeTestimonial() {
    const [testimonials, setTestimonials] = useState([]);
    const [newTestimonial, setNewTestimonial] = useState({ name: "", position: "", testimonial: "" });
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const unsubscribe = onSnapshot(query(collection(db, "testimonials")), (querySnapshot) => {
            const testimonialsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTestimonials(testimonialsData);
        });

        return () => unsubscribe();
    }, []);

    async function addTestimonial() {
        try {
            if (!newTestimonial.name.trim() || !newTestimonial.position.trim() || !newTestimonial.testimonial.trim()) {
                return alert("Please fill in all fields");
            }

            await addDoc(collection(db, "testimonials"), {
                name: newTestimonial.name,
                position: newTestimonial.position,
                testimonial: newTestimonial.testimonial,
                comments: [],
                timestamp: serverTimestamp(),
            });

            setNewTestimonial({ name: "", position: "", testimonial: "" });
        } catch (error) {
            console.log(error);
        }
    }

    async function addComment(testimonialId) {
        try {
            const updatedTestimonials = testimonials.map(testimonial => {
                if (testimonial.id === testimonialId) {
                    return { ...testimonial, comments: [...testimonial.comments, newComment] };
                }
                return testimonial;
            });

            setTestimonials(updatedTestimonials);
            setNewComment("");

            // Update the testimonial document in Firestore with the new comment
            const testimonialRef = doc(db, "testimonials", testimonialId);
            await updateDoc(testimonialRef, { comments: updatedTestimonials.find(t => t.id === testimonialId).comments });
        } catch (error) {
            console.log(error);
        }
    }

    async function deleteTestimonial(id) {
        try {
            await deleteDoc(doc(db, "testimonials", id));
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <main className="px-4 flex flex-col gap-4">
            <header className="py-4 flex-row items-center">
                <h1 className="text-3xl font-bold">Resume Testimonials</h1>
            </header>
            <section>
                <div className="grid grid-cols-2 gap-4">
                    <input
                        type="text"
                        className="border p-2"
                        placeholder="Name"
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                    />
                    <input
                        type="text"
                        className="border p-2"
                        placeholder="Position"
                        value={newTestimonial.position}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, position: e.target.value })}
                    />
                </div>
                <textarea
                    className="border w-full p-2"
                    rows="5"
                    placeholder="Testimonial"
                    value={newTestimonial.testimonial}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, testimonial: e.target.value })}
                />
                <button className="border px-2 py-1 bg-blue-100" onClick={addTestimonial}>
                    Add Testimonial
                </button>
            </section>
            <section className="space-y-4">
                <h2 className="text-xl font-bold">Testimonials</h2>
                {testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="border p-4 bg-gray-100">
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="italic">{testimonial.position}</p>
                        <p>{testimonial.testimonial}</p>
                        <div className="flex items-center">
                            <input
                                type="text"
                                className="border p-2 w-full mr-2"
                                placeholder="Add a comment"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button className="border px-4 py-2 bg-green-100" onClick={() => addComment(testimonial.id)}>
                                Add Comment
                            </button>
                        </div>
                        <ul>
                            {testimonial.comments && testimonial.comments.map((comment, index) => (
                                <li key={index}>{comment}</li>
                            ))}
                        </ul>
                        <button className="border px-4 py-2 bg-red-100" onClick={() => deleteTestimonial(testimonial.id)}>
                            Delete
                        </button>
                    </div>
                ))}
            </section>
        </main>
    );
}
