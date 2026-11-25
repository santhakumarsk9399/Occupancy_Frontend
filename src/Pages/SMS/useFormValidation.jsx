import { useFormik } from "formik";
import * as Yup from "yup";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validationSchema = Yup.object().shape({
  groupName: Yup.string().required("Group name is required"),
  emailIds: Yup.array()
    .min(1, "At least one email is required")
    .of(Yup.string().matches(emailRegex, "Invalid email format")),
  threshold: Yup.string().required("Threshold is required"),
  zones: Yup.array().min(1, "Select at least one zone")
});

const useEmailGroupForm = ({ defaultData, onSave }) => {
  const formik = useFormik({
    initialValues: {
      groupName: defaultData?.groupName || "",
      emailInput: "",
      emailIds: (defaultData?.emailIds || []).sort((a, b) => a.localeCompare(b)),
      threshold: defaultData?.threshold || "",
      zones:
        defaultData?.zone?.map(z => ({ value: z, label: z })) || []
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      const payload = {
        groupName: values.groupName,
        emails: values.emailIds,
        threshold: values.threshold,
        zones: values.zones.map(z => z.value)
      };

      try {
        const response = await fetch("http://localhost:3001/emailGroup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Failed to add group");
        const added = await response.json();
        onSave(added);
      } catch (err) {
        alert("Error adding group");
      }

      setSubmitting(false);
    }
  });

  return formik;
};

export default useEmailGroupForm;




/*USAGE*/
///import useEmailGroupForm from "./useEmailGroupForm"; // adjust path as needed

//const formik = useEmailGroupForm({ defaultData, onSave });
// 
// Then replace <Formik> with regular <form onSubmit={formik.handleSubmit}>
// And use formik values: formik.values, formik.handleChange, etc.
